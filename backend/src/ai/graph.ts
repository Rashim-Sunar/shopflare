import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { callLLM } from './llm';
import { getIntentParserSystemPrompt, getSupervisorSystemPrompt } from './prompt';
import { checkProductAvailability, searchProducts } from '../tools/productTools';
import type { CatalogSearchFilters } from '../services/catalogSearchService';

/**
 * @fileoverview LangGraph workflow with supervisor-ready routing and Product Discovery specialization.
 *
 * Architecture:
 * - Supervisor node chooses a specialist agent route.
 * - Product Discovery agent parses user language into tool-ready filters using LLM-first extraction.
 * - Router/executor nodes perform deterministic tool calls.
 * - Response formatter remains grounded in tool output.
 */

type AgentType = 'product_discovery' | 'customer_rights' | 'admin_ops' | 'unknown';
type IntentType = 'availability' | 'search' | 'unknown';
type RouteType = 'tool' | 'fallback';

interface SupervisorDecision {
  agent: AgentType;
  reason: string;
}

interface ParsedIntent {
  intent: IntentType;
  productName: string;
  filters: CatalogSearchFilters & {
    keyword?: string;
  };
}

interface ToolExecutionResult {
  type: 'availability' | 'search' | 'fallback';
  payload: Record<string, unknown>;
  message: string;
}

const CATEGORY_VALUES = ['T-Shirts', 'Formal Shirts', 'Jeans', 'Sarees', 'Jackets', 'Sweaters', 'Shoes', 'Phones'];
const COLLECTION_VALUES = ['New Arrivals', 'Best Seller'];
const GENDER_VALUES = ['Men', 'Women', 'Unisex'];
const COLOR_VALUES = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Brown', 'Gray', 'Light Blue', 'Dark Blue', 'Navy', 'Cream'];
const SIZE_VALUES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', '28', '30', '32', '34', '36'];
const MATERIAL_VALUES = ['Cotton', 'Wool', 'Denim', 'Polyester', 'Silk', 'Linen', 'Viscose', 'Fleece'];
const BRAND_VALUES = [
  'Urban Threads',
  'Modern Fit',
  'Street Style',
  'Beach Breeze',
  'Fashioninsta',
  'Chicstyle',
  'StyleHub',
  'ElegantWear',
  'DenimPro',
  'TraditionalFashion',
  'SportZone',
  'FashionHub',
  'CozyWear',
];

const SORT_ALIASES: Record<string, 'low-high' | 'high-low' | 'popularity'> = {
  'low-high': 'low-high',
  lowhigh: 'low-high',
  'low to high': 'low-high',
  cheapest: 'low-high',
  'price asc': 'low-high',
  ascending: 'low-high',
  'high-low': 'high-low',
  highlow: 'high-low',
  'high to low': 'high-low',
  expensive: 'high-low',
  'price desc': 'high-low',
  descending: 'high-low',
  popularity: 'popularity',
  popular: 'popularity',
  trending: 'popularity',
};

const CATEGORY_ALIASES: Record<string, string> = {
  tshirt: 'T-Shirts',
  tshirts: 'T-Shirts',
  't shirt': 'T-Shirts',
  't shirts': 'T-Shirts',
  't-shirt': 'T-Shirts',
  't-shirts': 'T-Shirts',
  tee: 'T-Shirts',
  tees: 'T-Shirts',
  top: 'T-Shirts',
  tops: 'T-Shirts',
  'top wear': 'T-Shirts',
  'formal shirt': 'Formal Shirts',
  'formal shirts': 'Formal Shirts',
  'formal wear': 'Formal Shirts',
  shirt: 'Formal Shirts',
  shirts: 'Formal Shirts',
  'dress shirt': 'Formal Shirts',
  'dress shirts': 'Formal Shirts',
  'office shirt': 'Formal Shirts',
  jean: 'Jeans',
  jeans: 'Jeans',
  denim: 'Jeans',
  saree: 'Sarees',
  sarees: 'Sarees',
  sari: 'Sarees',
  jacket: 'Jackets',
  jackets: 'Jackets',
  outerwear: 'Jackets',
  sweater: 'Sweaters',
  sweaters: 'Sweaters',
  pullover: 'Sweaters',
  pullovers: 'Sweaters',
  shoe: 'Shoes',
  shoes: 'Shoes',
  sneaker: 'Shoes',
  sneakers: 'Shoes',
  trainer: 'Shoes',
  trainers: 'Shoes',
  phone: 'Phones',
  phones: 'Phones',
  mobile: 'Phones',
  mobiles: 'Phones',
  smartphone: 'Phones',
  smartphones: 'Phones',
};

const ChatbotState = Annotation.Root({
  userMessage: Annotation<string>,
  supervisor: Annotation<SupervisorDecision>,
  parsedIntent: Annotation<ParsedIntent>,
  route: Annotation<RouteType>,
  selectedTool: Annotation<string>,
  toolResult: Annotation<ToolExecutionResult>,
  finalResponse: Annotation<string>,
});

type ChatbotStateType = typeof ChatbotState.State;

function normalizeUserMessage(userMessage: string): string {
  return userMessage
    .replace(/[’']/g, "'")
    .replace(/\bcloths\b/gi, 'clothes')
    .replace(/\bmen['’]?s\b/gi, "men's")
    .replace(/\bwomen['’]?s\b/gi, "women's")
    .replace(/\bmens\b/gi, "men's")
    .replace(/\bwomens\b/gi, "women's")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeLookupKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\-_/]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function toNormalizedMap(values: string[]): Map<string, string> {
  return new Map(values.map((value) => [normalizeLookupKey(value), value]));
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function splitCsv(input: unknown): string[] {
  if (typeof input !== 'string') {
    return [];
  }

  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCanonicalCsv(rawValue: unknown, allowedValues: string[], aliases?: Record<string, string>): string | undefined {
  const allowedMap = toNormalizedMap(allowedValues);
  const values = splitCsv(rawValue);
  const canonicalValues: string[] = [];

  for (const value of values) {
    const key = normalizeLookupKey(value);
    const alias = aliases?.[key];
    const aliasKey = alias ? normalizeLookupKey(alias) : undefined;
    const canonical = (aliasKey ? allowedMap.get(aliasKey) : undefined) ?? allowedMap.get(key);

    if (canonical && !canonicalValues.includes(canonical)) {
      canonicalValues.push(canonical);
    }
  }

  return canonicalValues.length > 0 ? canonicalValues.join(',') : undefined;
}

function toCanonicalSort(rawValue: unknown): CatalogSearchFilters['sort'] {
  if (typeof rawValue !== 'string') {
    return undefined;
  }

  return SORT_ALIASES[normalizeLookupKey(rawValue)] ?? undefined;
}

function inferGenderFromMessage(userMessage: string): string | undefined {
  const lower = userMessage.toLowerCase();
  const genders: string[] = [];

  if (/(\bmen\b|\bmen's\b|\bmale\b|\bgents?\b)/i.test(lower)) {
    genders.push('Men');
  }

  if (/(\bwomen\b|\bwomen's\b|\bfemale\b|\bladies\b)/i.test(lower)) {
    genders.push('Women');
  }

  return genders.length > 0 ? Array.from(new Set(genders)).join(',') : undefined;
}

function inferCategoryFromMessage(userMessage: string): string | undefined {
  const lower = userMessage.toLowerCase();
  const categories: string[] = [];

  for (const [alias, value] of Object.entries(CATEGORY_ALIASES)) {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escapedAlias}\\b`, 'i').test(lower)) {
      categories.push(value);
    }
  }

  return categories.length > 0 ? Array.from(new Set(categories)).join(',') : undefined;
}

function sanitizeSearchText(rawSearch: string | undefined): string | undefined {
  if (!rawSearch) {
    return undefined;
  }

  const stopWords = new Set([
    'show',
    'me',
    'some',
    'any',
    'more',
    'next',
    'another',
    'also',
    'find',
    'search',
    'product',
    'products',
    'for',
    'please',
    'do',
    'you',
    'have',
    'i',
    'need',
    'want',
    'looking',
    'cloth',
    'clothes',
    'wear',
    'apparel',
    'outfit',
    'men',
    "men's",
    'women',
    "women's",
    'male',
    'female',
    's',
    'less',
    'than',
    'under',
    'below',
    'upto',
    'up',
    'to',
    'price',
    'cost',
    'costs',
    'priced',
    'which',
    'that',
    'with',
    'within',
    'between',
    'only',
    'rs',
    'inr',
    'dollar',
    'dollars',
  ]);

  const normalized = rawSearch
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return undefined;
  }

  const kept = normalized
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !stopWords.has(token) && !/^\d+$/.test(token));

  if (kept.length === 0) {
    return undefined;
  }

  return kept.slice(0, 6).join(' ');
}

function inferLimitFromMessage(userMessage: string): number | undefined {
  const lower = userMessage.toLowerCase();

  const countMatch =
    lower.match(/(?:show|give|find|list)\s+(?:me\s+)?(\d{1,2})\b/) ||
    lower.match(/\b(\d{1,2})\s+(?:products?|items?|shirts?|jackets?|shoes?|phones?)\b/);

  if (!countMatch) {
    return undefined;
  }

  const parsed = Number(countMatch[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.min(20, parsed);
}

function inferPriceBoundsFromMessage(userMessage: string): Pick<CatalogSearchFilters, 'minPrice' | 'maxPrice'> {
  const lower = userMessage.toLowerCase();

  const maxMatch =
    lower.match(/(?:under|below|less than|upto|up to|max(?:imum)?(?:\s+price)?)[\s:$]*([0-9]+(?:\.[0-9]+)?)/i) ||
    lower.match(/price\s*(?:under|below|less than)[\s:$]*([0-9]+(?:\.[0-9]+)?)/i);

  const minMatch =
    lower.match(/(?:above|over|more than|greater than|at least|min(?:imum)?(?:\s+price)?|from)[\s:$]*([0-9]+(?:\.[0-9]+)?)/i) ||
    lower.match(/price\s*(?:above|over|more than)[\s:$]*([0-9]+(?:\.[0-9]+)?)/i);

  const maxPrice = maxMatch ? Number(maxMatch[1]) : undefined;
  const minPrice = minMatch ? Number(minMatch[1]) : undefined;

  return {
    minPrice: typeof minPrice === 'number' && Number.isFinite(minPrice) && minPrice > 0 ? minPrice : undefined,
    maxPrice: typeof maxPrice === 'number' && Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
  };
}

function enrichParsedIntentWithMessage(parsed: ParsedIntent, userMessage: string): ParsedIntent {
  const inferredGender = inferGenderFromMessage(userMessage);
  const inferredCategory = inferCategoryFromMessage(userMessage);
  const inferredSearch = sanitizeSearchText(userMessage);
  const inferredPrice = inferPriceBoundsFromMessage(userMessage);
  const inferredLimit = inferLimitFromMessage(userMessage);
  const lower = userMessage.toLowerCase();

  const searchSignals =
    /(product|products|catalog|cloth|clothes|wear|apparel|outfit|show|find|search|available|in stock|do you have)/i.test(lower) ||
    Boolean(inferredGender || inferredCategory || inferredSearch);

  const intent: IntentType = parsed.intent === 'unknown' && searchSignals ? 'search' : parsed.intent;
  const sanitizedSearch = sanitizeSearchText(parsed.filters.search);
  const sanitizedKeyword = sanitizeSearchText(parsed.filters.keyword);

  return {
    intent,
    productName: parsed.productName,
    filters: {
      ...parsed.filters,
      gender: parsed.filters.gender || inferredGender,
      category: parsed.filters.category || inferredCategory,
      minPrice: parsed.filters.minPrice ?? inferredPrice.minPrice,
      maxPrice: parsed.filters.maxPrice ?? inferredPrice.maxPrice,
      search: sanitizedSearch || inferredSearch,
      keyword: sanitizedKeyword || sanitizedSearch || inferredSearch,
      page: parsed.filters.page ?? 1,
      limit: parsed.filters.limit ?? inferredLimit ?? 5,
    },
  };
}

function extractJsonObject(rawText: string): string | null {
  const firstCurly = rawText.indexOf('{');
  const lastCurly = rawText.lastIndexOf('}');

  if (firstCurly === -1 || lastCurly === -1 || lastCurly <= firstCurly) {
    return null;
  }

  return rawText.slice(firstCurly, lastCurly + 1);
}

function sanitizeSupervisorDecision(raw: Record<string, unknown>): SupervisorDecision {
  const agent =
    raw.agent === 'product_discovery' || raw.agent === 'customer_rights' || raw.agent === 'admin_ops'
      ? raw.agent
      : 'unknown';

  return {
    agent,
    reason: typeof raw.reason === 'string' ? raw.reason : '',
  };
}

function sanitizeParsedIntent(parsed: Partial<ParsedIntent>): ParsedIntent {
  const intent: IntentType = parsed.intent === 'availability' || parsed.intent === 'search' ? parsed.intent : 'unknown';

  const category = toCanonicalCsv(parsed.filters?.category, CATEGORY_VALUES, CATEGORY_ALIASES);
  const collection = toCanonicalCsv(parsed.filters?.collection, COLLECTION_VALUES);
  const gender = toCanonicalCsv(parsed.filters?.gender, GENDER_VALUES);
  const color = toCanonicalCsv(parsed.filters?.color, COLOR_VALUES);
  const size = toCanonicalCsv(parsed.filters?.size, SIZE_VALUES);
  const material = toCanonicalCsv(parsed.filters?.material, MATERIAL_VALUES);
  const brand = toCanonicalCsv(parsed.filters?.brand, BRAND_VALUES);
  const sort = toCanonicalSort(parsed.filters?.sort);

  const minPriceValue = parseNumber(parsed.filters?.minPrice);
  const maxPriceValue = parseNumber(parsed.filters?.maxPrice);
  const minPrice = typeof minPriceValue === 'number' && minPriceValue > 0 ? minPriceValue : undefined;
  const maxPrice = typeof maxPriceValue === 'number' && maxPriceValue > 0 ? maxPriceValue : undefined;

  const rawSearch = typeof parsed.filters?.search === 'string' ? parsed.filters.search.trim() : undefined;
  const rawKeyword = typeof parsed.filters?.keyword === 'string' ? parsed.filters.keyword.trim() : undefined;
  const search = sanitizeSearchText(rawSearch);
  const keyword = sanitizeSearchText(rawKeyword) ?? search;
  const page = Math.max(1, Math.floor(parseNumber(parsed.filters?.page) ?? 1));
  const parsedLimit = parseNumber(parsed.filters?.limit);
  const limit = typeof parsedLimit === 'number' ? Math.min(20, Math.max(1, Math.floor(parsedLimit))) : undefined;

  return {
    intent,
    productName: typeof parsed.productName === 'string' ? parsed.productName.trim() : '',
    filters: {
      collection,
      category,
      brand,
      gender,
      color,
      size,
      material,
      sort,
      search,
      page,
      limit,
      keyword,
      maxPrice,
      minPrice,
    },
  };
}

function parseSupervisorHeuristically(userMessage: string): SupervisorDecision {
  const lower = userMessage.toLowerCase();

  if (/(refund|return policy|returns|cancel order|cancellation|warranty|privacy policy|terms|customer rights)/i.test(lower)) {
    return { agent: 'customer_rights', reason: 'policy-or-rights-query' };
  }

  if (/(admin|update stock|change stock|update sku|publish product|delete product|manage order)/i.test(lower)) {
    return { agent: 'admin_ops', reason: 'admin-operation-query' };
  }

  if (/(product|catalog|show|find|search|available|in stock|do you have|price|size|color|brand|men|women|shoe|shirt|jacket|jeans|saree|phone|cloth|clothes|wear|apparel|outfit)/i.test(lower)) {
    return { agent: 'product_discovery', reason: 'product-discovery-query' };
  }

  return { agent: 'unknown', reason: 'out-of-domain' };
}

function parseIntentHeuristicFallback(userMessage: string): ParsedIntent {
  const lower = userMessage.toLowerCase();
  const availabilityHint = /(is|are|do you have|available|in stock)/i.test(lower);
  const looksSpecific = /(iphone|samsung|sku|model|\b\d{2,}\b)/i.test(lower);

  if (availabilityHint && looksSpecific) {
    return {
      intent: 'availability',
      productName: userMessage.replace(/^(is|are|do you have)\s+/i, '').replace(/\s+(available|in stock)\??$/i, '').trim(),
      filters: {
        page: 1,
        limit: 5,
      },
    };
  }

  return {
    intent: 'search',
    productName: '',
    filters: {
      gender: inferGenderFromMessage(userMessage),
      category: inferCategoryFromMessage(userMessage),
      ...inferPriceBoundsFromMessage(userMessage),
      search: sanitizeSearchText(userMessage),
      keyword: sanitizeSearchText(userMessage),
      page: 1,
      limit: inferLimitFromMessage(userMessage) ?? 5,
    },
  };
}

async function supervisorNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  const prompt = getSupervisorSystemPrompt();
  const normalizedMessage = normalizeUserMessage(state.userMessage);

  try {
    const raw = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: normalizedMessage },
    ]);

    const extractedJson = extractJsonObject(raw);
    const parsed = JSON.parse(extractedJson ?? raw) as Record<string, unknown>;

    return {
      supervisor: sanitizeSupervisorDecision(parsed),
    };
  } catch {
    return {
      supervisor: parseSupervisorHeuristically(normalizedMessage),
    };
  }
}

async function parseIntentNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  if (state.supervisor.agent !== 'product_discovery') {
    return {
      parsedIntent: {
        intent: 'unknown',
        productName: '',
        filters: {
          page: 1,
          limit: 5,
        },
      },
    };
  }

  const parserPrompt = getIntentParserSystemPrompt();
  const normalizedMessage = normalizeUserMessage(state.userMessage);

  try {
    const raw = await callLLM([
      { role: 'system', content: parserPrompt },
      { role: 'user', content: normalizedMessage },
    ]);

    const extractedJson = extractJsonObject(raw);
    const parsed = JSON.parse(extractedJson ?? raw) as Partial<ParsedIntent>;
    const sanitized = sanitizeParsedIntent(parsed);
    const enriched = enrichParsedIntentWithMessage(sanitized, normalizedMessage);

    return {
      parsedIntent: enriched.intent === 'unknown' ? parseIntentHeuristicFallback(normalizedMessage) : enriched,
    };
  } catch {
    return {
      parsedIntent: parseIntentHeuristicFallback(normalizedMessage),
    };
  }
}

function formatGroundedResponse(toolPayload: Record<string, unknown>): string {
  const products = Array.isArray(toolPayload.products) ? toolPayload.products : [];

  if (products.length === 0) {
    return 'No products found';
  }

  const header = `Found ${products.length} product${products.length > 1 ? 's' : ''}:`;

  const lines = products.slice(0, 5).map((rawProduct, index) => {
    const product = rawProduct as Record<string, unknown>;
    const name = String(product.name ?? 'Unknown Product');
    const price = Number(product.price ?? 0);
    const category = String(product.category ?? 'N/A');
    const brand = product.brand ? String(product.brand) : 'N/A';
    const stock = Number(product.countInStock ?? 0);

    return `${index + 1}. ${name} | Price: ${price} | Category: ${category} | Brand: ${brand} | Stock: ${stock}`;
  });

  return [header, ...lines].join('\n');
}

function toolRouterNode(state: ChatbotStateType): Partial<ChatbotStateType> {
  if (state.supervisor.agent !== 'product_discovery') {
    return { route: 'fallback', selectedTool: 'none' };
  }

  const intent = state.parsedIntent.intent;

  if (intent === 'availability') {
    return { route: 'tool', selectedTool: 'checkProductAvailability' };
  }

  if (intent === 'search') {
    return { route: 'tool', selectedTool: 'searchProducts' };
  }

  return { route: 'fallback', selectedTool: 'none' };
}

async function toolExecutorNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  if (state.selectedTool === 'checkProductAvailability') {
    const availability = await checkProductAvailability(state.parsedIntent.productName ?? '');
    console.log('[AI CHAT] agent=product_discovery tool=checkProductAvailability intent=availability');

    return {
      toolResult: {
        type: 'availability',
        payload: availability as unknown as Record<string, unknown>,
        message: availability.message,
      },
    };
  }

  if (state.selectedTool === 'searchProducts') {
    const search = await searchProducts(state.parsedIntent.filters ?? {});
    console.log('[AI CHAT] agent=product_discovery tool=searchProducts intent=search');

    return {
      toolResult: {
        type: 'search',
        payload: search as unknown as Record<string, unknown>,
        message: search.message,
      },
    };
  }

  return {
    toolResult: {
      type: 'fallback',
      payload: {},
      message: 'Unsupported request for current agent configuration.',
    },
  };
}

async function responseGeneratorNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  if (state.route === 'fallback' || state.toolResult.type === 'fallback') {
    if (state.supervisor.agent === 'customer_rights') {
      return {
        finalResponse: 'Customer rights support is planned but not enabled yet. For now, I can help with product discovery only.',
      };
    }

    if (state.supervisor.agent === 'admin_ops') {
      return {
        finalResponse: 'Admin operations are planned with human-in-the-loop controls and are not enabled yet. I can help with product discovery only.',
      };
    }

    return {
      finalResponse: 'I can help with product availability and filtered product search only.',
    };
  }

  const toolPayload = state.toolResult.payload;
  const matchCount = Number(toolPayload.matchCount ?? 0);
  const products = Array.isArray(toolPayload.products) ? toolPayload.products : [];

  if (matchCount === 0 || products.length === 0) {
    return {
      finalResponse: 'No products found',
    };
  }

  return {
    finalResponse: formatGroundedResponse(toolPayload),
  };
}

const chatbotGraph = new StateGraph(ChatbotState)
  .addNode('supervisorRouter', supervisorNode)
  .addNode('intentParser', parseIntentNode)
  .addNode('toolRouter', toolRouterNode)
  .addNode('toolExecutor', toolExecutorNode)
  .addNode('responseGenerator', responseGeneratorNode)
  .addEdge(START, 'supervisorRouter')
  .addEdge('supervisorRouter', 'intentParser')
  .addEdge('intentParser', 'toolRouter')
  .addConditionalEdges('toolRouter', (state) => (state.route === 'tool' ? 'toolExecutor' : 'responseGenerator'), {
    toolExecutor: 'toolExecutor',
    responseGenerator: 'responseGenerator',
  })
  .addEdge('toolExecutor', 'responseGenerator')
  .addEdge('responseGenerator', END)
  .compile();

export async function runAiChatGraph(userMessage: string): Promise<string> {
  console.log(`[AI CHAT] query=${userMessage}`);

  const result = await chatbotGraph.invoke({
    userMessage,
    supervisor: {
      agent: 'unknown',
      reason: '',
    },
    parsedIntent: {
      intent: 'unknown',
      productName: '',
      filters: {},
    },
    route: 'fallback',
    selectedTool: 'none',
    toolResult: {
      type: 'fallback',
      payload: {},
      message: '',
    },
    finalResponse: '',
  });

  console.log(
    `[AI CHAT] agent=${result.supervisor.agent} intent=${result.parsedIntent.intent} filters=${JSON.stringify(result.parsedIntent.filters)} tool=${result.selectedTool}`
  );

  return result.finalResponse || 'No products found';
}

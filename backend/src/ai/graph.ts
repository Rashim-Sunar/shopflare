import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { callLLM } from './llm';
import { getIntentParserSystemPrompt, getSupervisorSystemPrompt, getResponseGeneratorSystemPrompt, getCustomerRightsSystemPrompt } from './prompt';
import { checkProductAvailability, hybridSearchProducts } from '../tools/productTools';
import type { CatalogSearchFilters } from '../services/catalogSearchService';
import { searchPolicyContext } from '../services/policySearchService';

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
type IntentType = 'availability' | 'search' | 'policy_query' | 'unknown';
type RouteType = 'tool' | 'fallback';

/**
 * Interface: AiGraphResponse
 * -----------------------------------
 * Purpose:
 *   Represents the structured response from the AI chat graph.
 *
 * Fields:
 *   - response (string): Human-readable text response.
 *   - products (array): Array of product objects for UI rendering.
 */
interface AiGraphResponse {
  response: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    brand: string | null;
    category: string;
    countInStock: number;
    image?: string;
  }>;
}

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

interface PolicyContextChunk {
  documentId: string;
  documentName: string;
  version: string;
  chunkIndex: number;
  text: string;
  score: number;
  isActive: boolean;
}

const CATEGORY_VALUES = ['Top Wear', 'Bottom Wear'];
const SUBCATEGORY_VALUES = ['Activewear', 'Hoodies', 'Jackets', 'Leggings', 'Sportswear', 'T-Shirts', 'Tops', 'Trousers'];
const TYPE_VALUES = ['Casual', 'Formal', 'Sportswear'];
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
  top: 'Top Wear',
  tops: 'Top Wear',
  'top wear': 'Top Wear',
  bottom: 'Bottom Wear',
  bottoms: 'Bottom Wear',
  'bottom wear': 'Bottom Wear',
};

const SUBCATEGORY_ALIASES: Record<string, string> = {
  tshirt: 'T-Shirts',
  tshirts: 'T-Shirts',
  't shirt': 'T-Shirts',
  't shirts': 'T-Shirts',
  't-shirt': 'T-Shirts',
  't-shirts': 'T-Shirts',
  tee: 'T-Shirts',
  tees: 'T-Shirts',
  top: 'Tops',
  tops: 'Tops',
  hoodie: 'Hoodies',
  hoodies: 'Hoodies',
  sweatshirt: 'Hoodies',
  sweatshirts: 'Hoodies',
  jacket: 'Jackets',
  jackets: 'Jackets',
  trouser: 'Trousers',
  trousers: 'Trousers',
  pants: 'Trousers',
  pant: 'Trousers',
  legging: 'Leggings',
  leggings: 'Leggings',
  activewear: 'Activewear',
  sportswear: 'Sportswear',
  sports: 'Sportswear',
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
    .replace(/\bwomen\s*war\b/gi, "women's wear")
    .replace(/\bwomen['’]?s\s+war\b/gi, "women's wear")
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

function inferSubCategoryFromMessage(userMessage: string): string | undefined {
  const lower = userMessage.toLowerCase();
  const subCategories: string[] = [];

  for (const [alias, value] of Object.entries(SUBCATEGORY_ALIASES)) {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escapedAlias}\\b`, 'i').test(lower)) {
      subCategories.push(value);
    }
  }

  return subCategories.length > 0 ? Array.from(new Set(subCategories)).join(',') : undefined;
}

function inferExplicitWearCategory(userMessage: string): string | undefined {
  const lower = userMessage.toLowerCase();

  if (/\btop\s*wear\b/i.test(lower)) {
    return 'Top Wear';
  }

  if (/\bbottom\s*wear\b/i.test(lower)) {
    return 'Bottom Wear';
  }

  return undefined;
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
    'brand',
    'branded',
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
  const inferredSubCategory = inferSubCategoryFromMessage(userMessage);
  const explicitWearCategory = inferExplicitWearCategory(userMessage);
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
      category: explicitWearCategory || parsed.filters.category || inferredCategory,
      subCategory: parsed.filters.subCategory || inferredSubCategory,
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
  const intent: IntentType =
    parsed.intent === 'availability' || parsed.intent === 'search' || parsed.intent === 'policy_query' ? parsed.intent : 'unknown';

  const category = toCanonicalCsv(parsed.filters?.category, CATEGORY_VALUES, CATEGORY_ALIASES);
  const subCategory = toCanonicalCsv(parsed.filters?.subCategory, SUBCATEGORY_VALUES, SUBCATEGORY_ALIASES);
  const type = toCanonicalCsv(parsed.filters?.type, TYPE_VALUES);
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
      subCategory,
      type,
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

  if (availabilityHint) {
    const productName = userMessage.replace(/^(is|are|do you have)\s+/i, '').replace(/\s+(available|in stock)\??$/i, '').trim();

    if (productName && !/^(it|this|that)$/i.test(productName)) {
    return {
      intent: 'availability',
        productName,
      filters: {
        page: 1,
        limit: 5,
      },
    };
    }
  }

  if (/(refund|return policy|returns|cancel order|cancellation|warranty|privacy policy|terms|customer rights)/i.test(lower)) {
    return {
      intent: 'policy_query',
      productName: '',
      filters: {
        page: 1,
        limit: 5,
        search: sanitizeSearchText(userMessage),
        keyword: sanitizeSearchText(userMessage),
      },
    };
  }

  return {
    intent: 'search',
    productName: '',
    filters: {
      gender: inferGenderFromMessage(userMessage),
      category: inferCategoryFromMessage(userMessage),
      subCategory: inferSubCategoryFromMessage(userMessage),
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
    const decision = sanitizeSupervisorDecision(parsed);

    return {
      supervisor: decision.agent === 'unknown' ? parseSupervisorHeuristically(normalizedMessage) : decision,
    };
  } catch {
    return {
      supervisor: parseSupervisorHeuristically(normalizedMessage),
    };
  }
}

async function parseIntentNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  if (state.supervisor.agent !== 'product_discovery') {
    if (state.supervisor.agent === 'customer_rights') {
      return {
        parsedIntent: {
          intent: 'policy_query',
          productName: '',
          filters: {
            page: 1,
            limit: 5,
            search: sanitizeSearchText(state.userMessage),
            keyword: sanitizeSearchText(state.userMessage),
          },
        },
      };
    }

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

async function generateHelpfulFallback(userMessage: string, filters: CatalogSearchFilters & { keyword?: string }): Promise<string> {
  const systemPrompt = getResponseGeneratorSystemPrompt();
  const contextMessage = `User query: "${userMessage}"

Applied filters:
${JSON.stringify(filters, null, 2)}

No products were found matching these criteria. Provide a helpful fallback response that:
1. Acknowledges the search didn't return results.
2. Suggests alternative categories or subcategories relevant to what they asked for.
3. Offers to adjust filters (price, gender, brand, etc.).
4. Uses clarifying questions to help narrow down what they're looking for.

Keep the response concise and friendly.`;

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextMessage },
    ]);
    return response.trim() || 'No products found';
  } catch (error: unknown) {
    console.error('[AI CHAT] Failed to generate helpful fallback', error);
    return 'No products found';
  }
}

function toolRouterNode(state: ChatbotStateType): Partial<ChatbotStateType> {
  if (state.supervisor.agent === 'customer_rights') {
    return { route: 'tool', selectedTool: 'policyRag' };
  }

  if (state.supervisor.agent !== 'product_discovery') {
    return { route: 'fallback', selectedTool: 'none' };
  }

  const intent = state.parsedIntent.intent;

  if (intent === 'availability') {
    return { route: 'tool', selectedTool: 'checkProductAvailability' };
  }

  if (intent === 'search') {
    return { route: 'tool', selectedTool: 'hybridSearch' };
  }

  if (intent === 'policy_query') {
    return { route: 'tool', selectedTool: 'policyRag' };
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

  return {
    toolResult: {
      type: 'fallback',
      payload: {},
      message: 'Unsupported request for current agent configuration.',
    },
  };
}

/**
 * Function: hybridSearchNode
 * ----------------------------------------
 * Purpose:
 *   Combines semantic search (Qdrant) with structured filtering (MongoDB).
 *
 * Steps:
 *   1. Convert user query to embedding.
 *   2. Query Qdrant for top matches.
 *   3. Extract product IDs.
 *   4. Query MongoDB for full product details.
 *   5. Apply filters (price, category).
 *   6. Return enriched results.
 */
async function hybridSearchNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  const query = state.userMessage;
  const search = await hybridSearchProducts(query, state.parsedIntent.filters ?? {});
  console.log('[AI CHAT] agent=product_discovery tool=hybridSearch intent=search');

  return {
    toolResult: {
      type: 'search',
      payload: search as unknown as Record<string, unknown>,
      message: search.message,
    },
  };
}

/**
 * Function: customerRightsRagNode
 * ----------------------------------------
 * Purpose:
 *   Retrieves policy context from Qdrant and generates a grounded customer-rights answer.
 */
async function customerRightsRagNode(state: ChatbotStateType): Promise<Partial<ChatbotStateType>> {
  const chunks = await searchPolicyContext(state.userMessage, 4);

  if (chunks.length === 0) {
    return {
      finalResponse:
        'I could not find a currently active policy document that answers that question. Please ask an admin to upload or activate the relevant Customer Rights policy.',
    };
  }

  const systemPrompt = getCustomerRightsSystemPrompt();
  const policyContext = chunks
    .map((chunk: PolicyContextChunk, index: number) => {
      return [
        `Context ${index + 1}:`,
        `Policy: ${chunk.documentName}`,
        `Version: ${chunk.version}`,
        `Chunk: ${chunk.chunkIndex + 1}`,
        chunk.text,
      ].join('\n');
    })
    .join('\n\n');

  const prompt = `User question: ${state.userMessage}\n\nPolicy context:\n${policyContext}\n\nAnswer strictly from the policy context. If the context is not enough, say so clearly.`;

  try {
    const response = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);

    return {
      finalResponse:
        response.trim() ||
        'I could not generate a grounded answer from the current policy context. Please contact support or an admin.',
    };
  } catch (error: unknown) {
    console.error('[AI CHAT] Failed to generate customer-rights response', error);
    return {
      finalResponse:
        'I could not generate a grounded answer from the current policy context. Please contact support or an admin.',
    };
  }
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
    const fallbackResponse = await generateHelpfulFallback(state.userMessage, state.parsedIntent.filters);
    return {
      finalResponse: fallbackResponse,
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
  .addNode('hybridSearch', hybridSearchNode)
  .addNode('customerRightsRag', customerRightsRagNode)
  .addNode('responseGenerator', responseGeneratorNode)
  .addEdge(START, 'supervisorRouter')
  .addEdge('supervisorRouter', 'intentParser')
  .addEdge('intentParser', 'toolRouter')
  .addConditionalEdges(
    'toolRouter',
    (state) => {
      if (state.route !== 'tool') {
        return 'responseGenerator';
      }

      if (state.selectedTool === 'hybridSearch') {
        return 'hybridSearch';
      }

      if (state.selectedTool === 'policyRag') {
        return 'customerRightsRag';
      }

      return 'toolExecutor';
    },
    {
      toolExecutor: 'toolExecutor',
      hybridSearch: 'hybridSearch',
      customerRightsRag: 'customerRightsRag',
      responseGenerator: 'responseGenerator',
    }
  )
  .addEdge('toolExecutor', 'responseGenerator')
  .addEdge('hybridSearch', 'responseGenerator')
  .addEdge('customerRightsRag', END)
  .addEdge('responseGenerator', END)
  .compile();

export async function runAiChatGraph(userMessage: string): Promise<AiGraphResponse> {
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

  // Extract products from tool result payload if available for frontend rendering
  const toolPayload = result.toolResult?.payload as Record<string, unknown> | undefined;
  const products = Array.isArray(toolPayload?.products) ? (toolPayload.products as any[]) : [];

  return {
    response: result.finalResponse || 'No products found',
    products: products.slice(0, 10), // Limit to 10 products for UI display
  };
}

/**
 * @fileoverview Prompt templates for intent parsing and grounded response generation.
 */

const CATALOG_VALUES = {
  collections: ['New Arrivals', 'Best Seller'],
  categories: ['T-Shirts', 'Formal Shirts', 'Jeans', 'Sarees', 'Jackets', 'Sweaters', 'Shoes', 'Phones'],
  genders: ['Men', 'Women', 'Unisex'],
  colors: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Brown', 'Gray', 'Light Blue', 'Dark Blue', 'Navy', 'Cream'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', '28', '30', '32', '34', '36'],
  materials: ['Cotton', 'Wool', 'Denim', 'Polyester', 'Silk', 'Linen', 'Viscose', 'Fleece'],
  brands: [
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
  ],
  sort: ['low-high', 'high-low', 'popularity'],
};

/**
 * Function: getSupervisorSystemPrompt
 * -----------------------------------
 * Purpose:
 *   Returns a strict router prompt for future multi-agent orchestration.
 *
 * Inputs:
 *   - None
 *
 * Outputs:
 *   - A string prompt instructing the model to select the best specialist agent.
 */
export function getSupervisorSystemPrompt(): string {
  return [
    'You are the supervisor router for an eCommerce assistant.',
    'Return ONLY valid JSON. No markdown, no prose.',
    'Output schema:',
    '{',
    '  "agent": "product_discovery" | "customer_rights" | "admin_ops" | "unknown",',
    '  "reason": "short reason"',
    '}',
    'Routing rules:',
    '- product_discovery: shopping/product discovery, availability, product recommendations, catalog filters, price and size queries.',
    '- customer_rights: return policy, refund policy, cancellation policy, terms/rights, warranty policy.',
    '- admin_ops: stock updates, SKU updates, publishing products, order management commands from admin context.',
    '- unknown: out-of-domain or ambiguous requests.',
  ].join('\n');
}

/**
 * Function: getIntentParserSystemPrompt
 * -----------------------------------
 * Purpose:
 *   Returns the system prompt used to convert a user message into a strict JSON intent payload.
 *
 * Inputs:
 *   - None
 *
 * Outputs:
 *   - A string prompt that instructs the LLM to emit parseable JSON only.
 *
 * Steps:
 *   1. Define supported intents and output schema.
 *   2. Explain extraction rules for productName and filters.
 *   3. Force JSON-only output to simplify deterministic parsing.
 */
export function getIntentParserSystemPrompt(): string {
  const catalogValuesJson = JSON.stringify(CATALOG_VALUES, null, 2);

  return [
    'You are the Product Discovery Agent for an eCommerce assistant.',
    'Your task is to read the user query and convert it into strict JSON for tool execution.',
    'This is a tool-planning step only. Never answer like a chatbot here.',
    'Return ONLY valid JSON. No markdown, no prose.',
    'Available tools and contracts:',
    '- checkProductAvailability(productName: string) -> use only for specific product availability checks.',
    '- searchProducts(filters: CatalogSearchFilters) -> use for category/gender/size/color/material/brand/price/search/collection queries.',
    'Canonical catalog values (prefer these exact values):',
    catalogValuesJson,
    'Output JSON schema:',
    '{',
    '  "intent": "availability" | "search" | "unknown",',
    '  "productName": "",',
    '  "filters": {',
    '    "collection": "",',
    '    "category": "",',
    '    "brand": "",',
    '    "gender": "",',
    '    "color": "",',
    '    "size": "",',
    '    "material": "",',
    '    "sort": "",',
    '    "search": "",',
    '    "page": 1,',
    '    "limit": 5,',
    '    "keyword": "",',
    '    "minPrice": 0,',
    '    "maxPrice": 0',
    '  }',
    '}',
    'Rules:',
    '- Use intent=availability when the user asks stock/availability of a specific product model/name.',
    '- Use intent=search for broad discovery requests (for example: "do you have tshirts for men", "show affordable jackets").',
    '- Use intent=unknown only when the message is clearly not product-discovery.',
    '- For search intent, put extracted constraints into filters and keep productName empty.',
    '- For availability intent, set productName and keep filters minimal.',
    '- Use comma-separated strings for multi-value filters (example: "T-Shirts,Jackets").',
    '- Map synonyms: tee/tshirt/t-shirt/tops -> T-Shirts, shirt/shirts/formal wear -> Formal Shirts, sneakers/trainers -> Shoes, mobile/smartphone -> Phones.',
    '- Treat "mens wear" and "for men" as gender=Men. Treat "womens wear" and "for women" as gender=Women.',
    '- Treat under/below/up to as maxPrice; minimum/at least/from as minPrice.',
    '- If user asks for a count (for example: "show me 3 shirts"), set limit to that count (max 20).',
    '- If category is not explicit, set search with meaningful key terms from the user message.',
    '- Keep page=1 and limit=5 unless user explicitly asks for a different count.',
    'Few-shot examples:',
    'User: "do you have the tshirts for men"',
    'JSON: {"intent":"search","productName":"","filters":{"collection":"","category":"T-Shirts","brand":"","gender":"Men","color":"","size":"","material":"","sort":"","search":"tshirts for men","page":1,"limit":5,"keyword":"tshirts","minPrice":0,"maxPrice":0}}',
    'User: "show me black denim jackets under 3000"',
    'JSON: {"intent":"search","productName":"","filters":{"collection":"","category":"Jackets","brand":"","gender":"","color":"Black","size":"","material":"Denim","sort":"","search":"black denim jackets","page":1,"limit":5,"keyword":"jackets","minPrice":0,"maxPrice":3000}}',
    'User: "mens wear"',
    'JSON: {"intent":"search","productName":"","filters":{"collection":"","category":"","brand":"","gender":"Men","color":"","size":"","material":"","sort":"","search":"","page":1,"limit":5,"keyword":"","minPrice":0,"maxPrice":0}}',
    'User: "women wear"',
    'JSON: {"intent":"search","productName":"","filters":{"collection":"","category":"","brand":"","gender":"Women","color":"","size":"","material":"","sort":"","search":"","page":1,"limit":5,"keyword":"","minPrice":0,"maxPrice":0}}',
    'User: "show me some product"',
    'JSON: {"intent":"search","productName":"","filters":{"collection":"","category":"","brand":"","gender":"","color":"","size":"","material":"","sort":"","search":"","page":1,"limit":5,"keyword":"","minPrice":0,"maxPrice":0}}',
    'User: "is iPhone 13 available"',
    'JSON: {"intent":"availability","productName":"iPhone 13","filters":{"collection":"","category":"","brand":"","gender":"","color":"","size":"","material":"","sort":"","search":"","page":1,"limit":5,"keyword":"","minPrice":0,"maxPrice":0}}',
  ].join('\n');
}

/**
 * Function: getResponseGeneratorSystemPrompt
 * -----------------------------------
 * Purpose:
 *   Returns the system prompt that forces grounded responses from tool output only.
 *
 * Inputs:
 *   - None
 *
 * Outputs:
 *   - A string prompt that prohibits fabricated product claims.
 *
 * Steps:
 *   1. Define strict grounding behavior.
 *   2. Instruct model to rely only on tool JSON.
 *   3. Add explicit fallback for empty or missing data.
 */
export function getResponseGeneratorSystemPrompt(): string {
  return [
    'You are a grounded eCommerce response formatter.',
    'Use ONLY the provided tool output JSON.',
    'Do not invent products, prices, brands, stock values, or categories.',
    'If the tool output indicates no matches, reply exactly: "No products found".',
    'Keep responses concise and factual.',
  ].join('\n');
}

import Product from '../models/Product';
import { searchCatalogProducts, type CatalogSearchFilters, type CatalogSearchResult } from '../services/catalogSearchService';
import { hybridSearch } from '../services/hybridSearchService';

/**
 * @fileoverview MongoDB-backed tools used by the AI graph to answer product queries.
 */

interface SafeProduct {
  id: string;
  name: string;
  price: number;
  brand: string | null;
  category: string;
  countInStock: number;
  image?: string;
}

interface AvailabilityResult {
  type: 'availability';
  productName: string;
  matchCount: number;
  availableCount: number;
  products: SafeProduct[];
  message: string;
}

interface SearchFilters {
  category?: string;
  subCategory?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  gender?: string;
  keyword?: string;
  collection?: string;
  color?: string;
  size?: string;
  material?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface SearchResult {
  type: 'search';
  filters: SearchFilters;
  matchCount: number;
  products: SafeProduct[];
  message: string;
}

interface HybridSearchResult {
  type: 'hybrid_search';
  query: string;
  filters: SearchFilters;
  matchCount: number;
  products: SafeProduct[];
  message: string;
}

/**
 * Function: toSafeProduct
 * -----------------------------------
 * Purpose:
 *   Maps a full Product document into a safe, minimal shape for chatbot responses.
 *
 * Steps:
 *   1. Read required product fields.
 *   2. Normalize optional fields such as brand.
 *   3. Return a consistent API-safe object.
 */
function toSafeProduct(product: any): SafeProduct {
  return {
    id: String(product._id),
    name: String(product.name),
    price: Number(product.price),
    brand: product.brand ? String(product.brand) : null,
    category: String(product.category),
    countInStock: Number(product.countInStock),
    // Provide a primary image URL when available to support rich UI rendering
    image: Array.isArray(product.images) && product.images.length > 0 ? String(product.images[0].url) : '',
  };
}

function toFlexibleNameRegex(input: string): RegExp | undefined {
  const tokens = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[\-_/]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .slice(0, 6)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (tokens.length === 0) {
    return undefined;
  }

  return new RegExp(tokens.join('.*'), 'i');
}

/**
 * Function: checkProductAvailability
 * -----------------------------------
 * Purpose:
 *   Checks whether products matching a name query exist and have stock available.
 *
 * Steps:
 *   1. Validate the productName input.
 *   2. Run a case-insensitive name query in MongoDB.
 *   3. Filter results where countInStock > 0.
 *   4. Return a structured result payload.
 *
 * Indexing suggestion:
 *   - Add an index on { name: 1, countInStock: 1 } for faster availability lookups.
 */
export async function checkProductAvailability(productName: string): Promise<AvailabilityResult> {
  const trimmedName = productName.trim();
  const flexibleNameRegex = toFlexibleNameRegex(trimmedName);

  if (!trimmedName) {
    return {
      type: 'availability',
      productName: '',
      matchCount: 0,
      availableCount: 0,
      products: [],
      message: 'No products found',
    };
  }

  const allMatches = await Product.find({
    name: { $regex: flexibleNameRegex ?? new RegExp(trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    isPublished: true,
  })
    .select('_id name price brand category countInStock images')
    .limit(10)
    .lean();

  const availableMatches = allMatches.filter((product) => Number(product.countInStock) > 0);

  if (availableMatches.length === 0) {
    return {
      type: 'availability',
      productName: trimmedName,
      matchCount: allMatches.length,
      availableCount: 0,
      products: [],
      message: 'No products found',
    };
  }

  return {
    type: 'availability',
    productName: trimmedName,
    matchCount: allMatches.length,
    availableCount: availableMatches.length,
    products: availableMatches.map(toSafeProduct),
    message: 'Availability results found',
  };
}

/**
 * Function: searchProducts
 * -----------------------------------
 * Purpose:
 *   Searches catalog products using optional category, maxPrice, and brand filters.
 *
 * Steps:
 *   1. Build a dynamic MongoDB query from provided filters.
 *   2. Execute the query against published products.
 *   3. Limit output to 5 records to keep responses compact.
 *   4. Return structured output, including empty-result fallback.
 *
 * Indexing suggestion:
 *   - Add compound index on { category: 1, brand: 1, price: 1, isPublished: 1 }.
 */
export async function searchProducts(filters: SearchFilters): Promise<SearchResult> {
  const catalogSearchResult = (await searchCatalogProducts({
    collection: filters.collection,
    category: filters.category,
    subCategory: filters.subCategory,
    type: filters.type,
    gender: filters.gender,
    color: filters.color,
    size: filters.size,
    material: filters.material,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    search: filters.search ?? filters.keyword,
    page: filters.page,
    limit: filters.limit ?? 5,
  } as CatalogSearchFilters)) as CatalogSearchResult;

  if (catalogSearchResult.products.length === 0) {
    return {
      type: 'search',
      filters,
      matchCount: 0,
      products: [],
      message: 'No products found',
    };
  }

  return {
    type: 'search',
    filters,
    matchCount: catalogSearchResult.totalProducts,
    products: catalogSearchResult.products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      category: product.category,
      countInStock: product.countInStock,
      image: product.image,
    })),
    message: 'Search results found',
  };
}

/**
 * Function: hybridSearchProducts
 * -----------------------------------
 * Purpose:
 *   Executes semantic-first product retrieval and enriches with MongoDB truth data.
 *
 * Inputs:
 *   - query (string): Natural language user query.
 *   - filters (SearchFilters): Structured constraints such as category and price.
 *
 * Outputs:
 *   - Promise<HybridSearchResult>: Hybrid search response payload.
 *
 * Steps:
 *   1. Normalize a query fallback from keyword/search fields.
 *   2. Run hybrid search against Qdrant + MongoDB.
 *   3. Convert products into safe response shape.
 *   4. Return grounded results with match metadata.
 */
export async function hybridSearchProducts(query: string, filters: SearchFilters): Promise<HybridSearchResult> {
  const resolvedQuery = query.trim() || filters.search?.trim() || filters.keyword?.trim() || '';

  if (!resolvedQuery) {
    return {
      type: 'hybrid_search',
      query: '',
      filters,
      matchCount: 0,
      products: [],
      message: 'No products found',
    };
  }

  const catalogFilters = {
    collection: filters.collection,
    category: filters.category,
    subCategory: filters.subCategory,
    type: filters.type,
    gender: filters.gender,
    color: filters.color,
    size: filters.size,
    material: filters.material,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  } as CatalogSearchFilters;

  try {
    const result = await hybridSearch(resolvedQuery, catalogFilters);

    // Fallback to MongoDB search when vector index is empty or stale.
    if (result.totalProducts === 0) {
      const fallback = await searchProducts({
        ...filters,
        search: filters.search ?? filters.keyword,
        keyword: filters.keyword,
      });

      return {
        type: 'hybrid_search',
        query: resolvedQuery,
        filters,
        matchCount: fallback.matchCount,
        products: fallback.products,
        message: fallback.message,
      };
    }

    return {
      type: 'hybrid_search',
      query: resolvedQuery,
      filters,
      matchCount: result.totalProducts,
      products: result.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        countInStock: product.countInStock,
        image: product.image,
      })),
      message: result.message,
    };
  } catch (error: unknown) {
    console.error('[AI SEARCH] Hybrid search failed; falling back to MongoDB search', error);

    const fallback = await searchProducts({
      ...filters,
      search: filters.search ?? filters.keyword,
      keyword: filters.keyword,
    });

    return {
      type: 'hybrid_search',
      query: resolvedQuery,
      filters,
      matchCount: fallback.matchCount,
      products: fallback.products,
      message: fallback.message,
    };
  }
}

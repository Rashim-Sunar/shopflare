import Product from '../models/Product';

/**
 * @fileoverview Shared catalog search service used by the product controller and AI tooling.
 */

export interface CatalogSearchFilters {
  collection?: string;
  category?: string;
  subCategory?: string;
  type?: string;
  gender?: string;
  color?: string;
  size?: string;
  material?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CatalogSearchProduct {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string | null;
  gender: string | null;
  colors: string[];
  sizes: string[];
  collections: string;
  material: string | null;
  countInStock: number;
  image?: string;
}

export interface CatalogSearchResult {
  products: CatalogSearchProduct[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  appliedFilters: CatalogSearchFilters;
  message: string;
}

/**
 * Function: toCaseInsensitiveInFilter
 * -----------------------------------
 * Purpose:
 *   Converts comma-separated filter text into case-insensitive regex tokens for resilient matching.
 *
 * Inputs:
 *   - rawValue (string): Comma-separated filter values.
 *
 * Outputs:
 *   - Array of anchored RegExp values or undefined.
 *
 * Steps:
 *   1. Split by comma and trim values.
 *   2. Escape regex metacharacters for safety.
 *   3. Create anchored case-insensitive regex values.
 */
function toCaseInsensitiveInFilter(rawValue: string): RegExp[] | undefined {
  const values = rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length === 0) {
    return undefined;
  }

  return values.map((value) => {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}$`, 'i');
  });
}

/**
 * Function: toFlexibleTextSearchRegex
 * -----------------------------------
 * Purpose:
 *   Converts free-text input into a resilient regex that tolerates hyphens/spaces and typos in separators.
 *
 * Inputs:
 *   - rawSearch (string): User-provided search text.
 *
 * Outputs:
 *   - RegExp or undefined when no useful tokens exist.
 */
function toFlexibleTextSearchRegex(rawSearch: string): RegExp | undefined {
  const toSingular = (token: string): string => {
    if (token.endsWith('ies') && token.length > 4) {
      return `${token.slice(0, -3)}y`;
    }

    if (token.endsWith('s') && token.length > 3) {
      return token.slice(0, -1);
    }

    return token;
  };

  const tokens = rawSearch
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[\-_/]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .slice(0, 8)
    .map((token) => {
      const escapedOriginal = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const singular = toSingular(token);
      const escapedSingular = singular.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      if (escapedOriginal === escapedSingular) {
        return escapedOriginal;
      }

      return `(?:${escapedOriginal}|${escapedSingular})`;
    });

  if (tokens.length === 0) {
    return undefined;
  }

  return new RegExp(tokens.join('.*'), 'i');
}

/**
 * Function: toCatalogSearchProduct
 * -----------------------------------
 * Purpose:
 *   Converts a Product document into a lightweight response object for search results.
 *
 * Steps:
 *   1. Read the product's display fields.
 *   2. Normalize optional values.
 *   3. Return a stable API-safe object.
 */
function toCatalogSearchProduct(product: any): CatalogSearchProduct {
  return {
    id: String(product._id),
    name: String(product.name),
    price: Number(product.price),
    discountPrice: typeof product.discountPrice === 'number' ? product.discountPrice : undefined,
    category: String(product.category),
    brand: product.brand ? String(product.brand) : null,
    gender: product.gender ? String(product.gender) : null,
    colors: Array.isArray(product.colors) ? product.colors.map(String) : [],
    sizes: Array.isArray(product.sizes) ? product.sizes.map(String) : [],
    collections: String(product.collections),
    material: product.material ? String(product.material) : null,
    countInStock: Number(product.countInStock),
    image: Array.isArray(product.images) && product.images.length > 0 ? String(product.images[0].url) : undefined,
  };
}

/**
 * Function: buildCatalogQuery
 * -----------------------------------
 * Purpose:
 *   Creates the MongoDB query object used by the existing product listing controller rules.
 *
 * Steps:
 *   1. Start with published products only.
 *   2. Apply string array filters using $in semantics.
 *   3. Apply price bounds and text search when present.
 */
export function buildCatalogQuery(filters: CatalogSearchFilters): Record<string, unknown> {
  const query: Record<string, unknown> = { isPublished: true };

  if (filters.collection && filters.collection.toLowerCase() !== 'all') {
    const collectionRegex = toCaseInsensitiveInFilter(filters.collection);
    if (collectionRegex) {
      query.collections = { $in: collectionRegex };
    }
  }
  if (filters.category) {
    const categoryRegex = toCaseInsensitiveInFilter(filters.category);
    if (categoryRegex) {
      query.category = { $in: categoryRegex };
    }
  }
  if (filters.subCategory) {
    const subCategoryRegex = toCaseInsensitiveInFilter(filters.subCategory);
    if (subCategoryRegex) {
      query.subCategory = { $in: subCategoryRegex };
    }
  }
  if (filters.type) {
    const typeRegex = toCaseInsensitiveInFilter(filters.type);
    if (typeRegex) {
      query.type = { $in: typeRegex };
    }
  }
  if (filters.gender) {
    const genderRegex = toCaseInsensitiveInFilter(filters.gender);
    if (genderRegex) {
      query.gender = { $in: genderRegex };
    }
  }
  if (filters.color) {
    const colorRegex = toCaseInsensitiveInFilter(filters.color);
    if (colorRegex) {
      query.colors = { $in: colorRegex };
    }
  }
  if (filters.size) {
    const sizeRegex = toCaseInsensitiveInFilter(filters.size);
    if (sizeRegex) {
      query.sizes = { $in: sizeRegex };
    }
  }
  if (filters.material) {
    const materialRegex = toCaseInsensitiveInFilter(filters.material);
    if (materialRegex) {
      query.material = { $in: materialRegex };
    }
  }
  if (filters.brand) {
    const brandRegex = toCaseInsensitiveInFilter(filters.brand);
    if (brandRegex) {
      query.brand = { $in: brandRegex };
    }
  }

  if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
    query.price = {};
    if (typeof filters.minPrice === 'number') {
      (query.price as Record<string, number>).$gte = filters.minPrice;
    }
    if (typeof filters.maxPrice === 'number') {
      (query.price as Record<string, number>).$lte = filters.maxPrice;
    }
  }

  if (filters.search) {
    const flexibleSearchRegex = toFlexibleTextSearchRegex(filters.search);
    if (flexibleSearchRegex) {
      query.$or = [{ name: { $regex: flexibleSearchRegex } }, { description: { $regex: flexibleSearchRegex } }];
    }
  }

  return query;
}

/**
 * Function: searchCatalogProducts
 * -----------------------------------
 * Purpose:
 *   Searches the product catalog using the same filter semantics as the collection page.
 *
 * Steps:
 *   1. Build the MongoDB query using the shared helper.
 *   2. Apply sorting and pagination.
 *   3. Return a compact, response-ready payload.
 */
export async function searchCatalogProducts(filters: CatalogSearchFilters): Promise<CatalogSearchResult> {
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const limit = Math.max(1, Math.floor(filters.limit ?? 5));
  const skip = (page - 1) * limit;
  const query = buildCatalogQuery(filters);

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters.sort === 'low-high') {
    sortOption = { price: 1 };
  } else if (filters.sort === 'high-low') {
    sortOption = { price: -1 };
  } else if (filters.sort === 'popularity') {
    sortOption = { rating: -1 };
  }

  const products = await Product.find(query)
    .select('_id name price discountPrice category brand gender colors sizes collections material countInStock images')
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();
  const totalProducts = await Product.countDocuments(query);

  return {
    products: products.map(toCatalogSearchProduct),
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: page,
    appliedFilters: filters,
    message: products.length === 0 ? 'No products found' : 'Products found',
  };
}

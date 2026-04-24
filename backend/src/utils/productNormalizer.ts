/**
 * @fileoverview Data normalization utility for product pipeline.
 *
 * Ensures generated products meet schema requirements:
 * - Valid gender/subCategory/type combinations
 * - Non-empty required fields
 * - Consistent data types
 *
 * Used by:
 * - seedProducts.ts (pre-insertion validation)
 */

import type { IProduct } from '../types/product';
import { isValidSubCategory, isValidType } from '../config/clothingStructure';
import { Types } from 'mongoose';

export interface RawProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  gender?: string;
  mainCategory?: string;
  subCategory?: string;
  type?: string;
  sizes?: string[];
  colors?: string[];
  countInStock?: number;
  rating?: number;
  material?: string;
  images?: Array<{ url: string; altText?: string }>;
  collections?: string;
  sku?: string;
  user?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  tags?: string[];
}

/**
 * Function: normalizeProduct
 * -----------------------------------
 * Purpose:
 *   Validates and normalizes raw product data before MongoDB insertion.
 *   Applies defaults, strips invalid values, and enforces constraints.
 *
 * Inputs:
 *   - raw: Partial product data from scraper or manual input
 *   - userIdForAdmin: ObjectId string for admin user
 *
 * Outputs:
 *   - Normalized product object or null if invalid
 *
 * Steps:
 *   1. Check required fields (name, price, gender, subCategory).
 *   2. Validate gender/subCategory/type combinations.
 *   3. Apply defaults (brand, rating, stock, images).
 *   4. Sanitize and normalize arrays (sizes, colors, tags).
 *   5. Return normalized object or null on failure.
 *
 * Edge Cases:
 *   - Missing brand → "Generic"
 *   - Missing rating → 4.0
 *   - Empty images → skip product (invalid)
 *   - Invalid subCategory → null (skip product)
 */
export function normalizeProduct(raw: RawProductData, userIdForAdmin: string): IProduct | null {
  // Validate required fields
  if (!raw.name || typeof raw.name !== 'string' || raw.name.trim().length === 0) {
    console.warn('❌ Product rejected: missing or empty name');
    return null;
  }

  if (raw.price === undefined || typeof raw.price !== 'number' || raw.price < 0) {
    console.warn(`❌ Product "${raw.name}" rejected: invalid price`);
    return null;
  }

  if (!raw.gender || !['Men', 'Women', 'Unisex'].includes(raw.gender)) {
    console.warn(`❌ Product "${raw.name}" rejected: invalid or missing gender`);
    return null;
  }

  // Validate subCategory against gender
  if (raw.subCategory && !isValidSubCategory(raw.gender as 'Men' | 'Women', raw.subCategory)) {
    console.warn(`❌ Product "${raw.name}" rejected: invalid subCategory "${raw.subCategory}" for gender "${raw.gender}"`);
    return null;
  }

  // Validate type if provided
  if (raw.type && !isValidType(raw.type)) {
    console.warn(`❌ Product "${raw.name}" rejected: invalid type "${raw.type}"`);
    return null;
  }

  // Validate and sanitize images (at least one required)
  const images = Array.isArray(raw.images) ? raw.images.filter((img) => img && typeof img.url === 'string' && img.url.length > 0) : [];
  if (images.length === 0) {
    console.warn(`❌ Product "${raw.name}" rejected: empty or invalid images`);
    return null;
  }

  // Fetch or generate SKU
  const sku = raw.sku || `SKU-${raw.gender}-${raw.subCategory || 'GENERAL'}-${Date.now()}`;

  // Normalize sizes and colors
  const sizes = Array.isArray(raw.sizes) ? raw.sizes.filter((s) => typeof s === 'string' && s.trim().length > 0) : ['S', 'M', 'L', 'XL'];
  const colors = Array.isArray(raw.colors) ? raw.colors.filter((c) => typeof c === 'string' && c.trim().length > 0) : ['Black', 'White'];

  const legacyCategory =
    typeof raw.category === 'string' && raw.category.trim().length > 0
      ? raw.category.trim()
      : raw.subCategory || raw.mainCategory || 'Clothing';

  // Normalized product object
  const normalized: Partial<IProduct> = {
    name: raw.name.trim(),
    description: raw.description && typeof raw.description === 'string' ? raw.description.trim() : `${raw.name} - High quality product`,
    price: raw.price,
    countInStock: typeof raw.countInStock === 'number' && raw.countInStock >= 0 ? raw.countInStock : Math.floor(Math.random() * 90) + 10,
    sku,
    category: legacyCategory,
    mainCategory: raw.mainCategory || 'Clothing',
    subCategory: raw.subCategory,
    type: raw.type,
    brand: (typeof raw.brand === 'string' && raw.brand.trim().length > 0) ? raw.brand.trim() : 'Generic',
    gender: raw.gender as 'Men' | 'Women' | 'Unisex',
    sizes,
    colors,
    images: images.map((img) => ({
      url: img.url,
      altText: img.altText || raw.name,
    })),
    collections: typeof raw.collections === 'string' && raw.collections.trim().length > 0 ? raw.collections : 'New Arrivals',
    material: (typeof raw.material === 'string' && raw.material.trim().length > 0) ? raw.material.trim() : undefined,
    rating: typeof raw.rating === 'number' && raw.rating >= 0 && raw.rating <= 5 ? raw.rating : 4.0,
    numReviews: 0,
    isFeatured: typeof raw.isFeatured === 'boolean' ? raw.isFeatured : false,
    isPublished: typeof raw.isPublished === 'boolean' ? raw.isPublished : true,
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t) => typeof t === 'string' && t.trim().length > 0) : [],
    user: new Types.ObjectId(userIdForAdmin),
    metaTitle: `${raw.name} | Online Store`,
    metaDescription: raw.description && typeof raw.description === 'string' ? raw.description.substring(0, 160) : undefined,
  };

  return normalized as IProduct;
}

/**
 * Function: normalizeProductBatch
 * -----------------------------------
 * Purpose:
 *   Normalizes an array of raw products and returns valid ones.
 *
 * Example:
 *   const scraped = [{ name: 'Shirt', price: 500, gender: 'Men', ... }, ...];
 *   const normalized = normalizeProductBatch(scraped, adminId);
 *   // Returns only valid products; logs warnings for rejected ones
 */
export function normalizeProductBatch(products: RawProductData[], userIdForAdmin: string): IProduct[] {
  console.log(`🔄 Normalizing ${products.length} products...`);
  const valid = products
    .map((product) => normalizeProduct(product, userIdForAdmin))
    .filter((product) => product !== null) as IProduct[];

  console.log(`✅ Normalized ${valid.length}/${products.length} products (${products.length - valid.length} rejected)`);
  return valid;
}

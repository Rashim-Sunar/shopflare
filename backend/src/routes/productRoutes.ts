import { Router } from 'express';
import { getAllProducts, getProductById, getBestSeller, getNewArrivals, getSimilarProducts, getFilterOptions } from '../controllers/productController';

/**
 * @fileoverview Public product listing and search routes.
 */

const router = Router();

/**
 * @route GET /api/products/best-seller
 * @description Retrieves the best-selling product (highest rating).
 * @access Public
 */
router.get('/best-seller', getBestSeller);

/**
 * @route GET /api/products/new-arrivals
 * @description Retrieves latest published products for homepage new arrivals.
 * @access Public
 */
router.get('/new-arrivals', getNewArrivals);

/**
 * @route GET /api/products/similar/:id
 * @description Retrieves products similar to a given product.
 * @access Public
 */
router.get('/similar/:id', getSimilarProducts);

/**
 * @route GET /api/products/filters
 * @description Retrieves all available filter options (genders, subCategories, types, brands, sizes, priceRange).
 * @access Public
 */
router.get('/filters', getFilterOptions);

/**
 * @route GET /api/products/:id
 * @description Retrieves a single product by ID.
 * @access Public
 */
router.get('/:id', getProductById);

/**
 * @route GET /api/products
 * @description Retrieves products with multi-faceted filtering, search, sorting, and pagination.
 * @query {string} collection - Filter by collection name
 * @query {string} category - Filter by categories (comma-separated)
 * @query {string} gender - Filter by gender (comma-separated)
 * @query {string} color - Filter by colors (comma-separated)
 * @query {string} size - Filter by sizes (comma-separated)
 * @query {string} material - Filter by material (comma-separated)
 * @query {string} brand - Filter by brand (comma-separated)
 * @query {string} minPrice - Minimum price filter
 * @query {string} maxPrice - Maximum price filter
 * @query {string} sort - Sort option: low-high, high-low, popularity
 * @query {string} search - Text search on product name and description
 * @query {string} page - Page number (default: 1)
 * @query {string} limit - Items per page (default: 12)
 * @access Public
 */
router.get('/', getAllProducts);

export default router;

import type { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { IProduct } from '../types/product';
import type { AuthenticatedRequest } from '../types/http';

/**
 * @fileoverview Product controller for catalog management: CRUD and filtered search operations.
 */

interface CreateProductRequest extends IProduct {}

interface ProductResponse {
  status: 'success';
  product?: IProduct;
  createdProduct?: IProduct;
  updatedProduct?: IProduct;
  message?: string;
}

interface ProductsResponse {
  status: 'success';
  products: IProduct[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
}

interface NewArrivalsResponse {
  status: 'success';
  newArrivals: IProduct[];
}

/**
 * @function createProduct
 * @description Creates a new product in the catalog assigned to the authenticated admin user.
 *
 * @steps
 * 1. Extract product fields from the request body.
 * 2. Attach the current user's ID as the product owner.
 * 3. Persist the product record and return it.
 *
 * @param {Request} req - Product creation request with all catalog fields.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the created product response.
 */
export const createProduct = asyncHandler(
  async (req: AuthenticatedRequest<never, ProductResponse, Partial<CreateProductRequest>>, res: Response<ProductResponse>, next: NextFunction) => {
    if (!req.user) {
      next(new AppError('User not authenticated', 401));
      return;
    }

    const productData = {
      ...req.body,
      user: req.user._id,
    };

    const createdProduct = await Product.create(productData);

    res.status(201).json({
      status: 'success',
      createdProduct,
    });
  }
);

/**
 * @function updateProduct
 * @description Updates product fields using shallow merge semantics (only provided fields are updated).
 *
 * @steps
 * 1. Find the product by route parameter ID.
 * 2. Update only fields that were provided in the request (null coalescing).
 * 3. Persist and return the updated product.
 *
 * @param {Request} req - Product update request with optional fields.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the updated product response.
 */
export const updateProduct = asyncHandler(
  async (req: AuthenticatedRequest<{ id: string }, ProductResponse, Partial<CreateProductRequest>>, res: Response<ProductResponse>, next: NextFunction) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid product id', 400));
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      next(new AppError('Product not found', 404));
      return;
    }

    // Shallow merge: update only provided fields
    Object.assign(product, req.body);

    const updatedProduct = await product.save();

    res.status(200).json({
      status: 'success',
      updatedProduct,
    });
  }
);

/**
 * @function deleteProduct
 * @description Removes a product from the catalog by ID.
 *
 * @steps
 * 1. Verify the product exists.
 * 2. Delete the record.
 * 3. Return success confirmation.
 *
 * @param {Request} req - Delete request targeting product by ID.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the deletion confirmation response.
 */
export const deleteProduct = asyncHandler(
  async (req: AuthenticatedRequest<{ id: string }, ProductResponse>, res: Response<ProductResponse>, next: NextFunction) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid product id', 400));
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      next(new AppError('Product not found', 404));
      return;
    }

    await product.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  }
);

/**
 * @function getAllProducts
 * @description Retrieves products with multi-faceted filtering, text search, sorting, and pagination.
 *
 * @steps
 * 1. Parse query parameters for filters, search terms, sort preference, and pagination.
 * 2. Build a MongoDB query object with $in and $regex operators for multi-value filters.
 * 3. Apply price range filtering if min/max provided.
 * 4. Apply text search with case-insensitive regex on name and description.
 * 5. Sort by specified criteria (price, rating, or creation date).
 * 6. Skip and limit records for pagination.
 * 7. Return products along with pagination metadata.
 *
 * @param {Request} req - Query parameters for filtering and pagination.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the filtered products response with metadata.
 */
export const getAllProducts = asyncHandler(
  async (
    req: AuthenticatedRequest<
      never,
      ProductsResponse,
      never,
      {
        collection?: string;
        category?: string;
        gender?: string;
        color?: string;
        size?: string;
        material?: string;
        brand?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
        search?: string;
        page?: string;
        limit?: string;
      }
    >,
    res: Response<ProductsResponse>,
    _next: NextFunction
  ) => {
    const { collection, category, gender, color, size, material, brand, minPrice, maxPrice, sort, search, page = '1', limit = '12' } = req.query;

    const query: Record<string, any> = {};

    // Always show published products (public listing)
    query.isPublished = true;

    // Step 2: Multi-value filters
    if (collection && String(collection).toLowerCase() !== 'all') {
      query.collections = collection;
    }
    if (category) {
      query.category = { $in: String(category).split(',') };
    }
    if (gender) {
      query.gender = { $in: String(gender).split(',') };
    }
    if (color) {
      query.colors = { $in: String(color).split(',') };
    }
    if (size) {
      query.sizes = { $in: String(size).split(',') };
    }
    if (material) {
      query.material = { $in: String(material).split(',') };
    }
    if (brand) {
      query.brand = { $in: String(brand).split(',') };
    }

    // Step 3: Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Step 4: Text search
    if (search) {
      query.$or = [{ name: { $regex: String(search), $options: 'i' } }, { description: { $regex: String(search), $options: 'i' } }];
    }

    // Step 5: Sorting
    let sortOption: Record<string, 1 | -1> = {};
    if (sort === 'low-high') {
      sortOption.price = 1;
    } else if (sort === 'high-low') {
      sortOption.price = -1;
    } else if (sort === 'popularity') {
      sortOption.rating = -1;
    } else {
      sortOption.createdAt = -1;
    }

    // Step 6: Pagination
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    // Step 7: Execute query and return results
    const products = await Product.find(query).sort(sortOption as Record<string, 1 | -1>).skip(skip).limit(parsedLimit);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parsedLimit);

    res.status(200).json({
      status: 'success',
      products,
      totalProducts,
      totalPages,
      currentPage: parsedPage,
    });
  }
);

/**
 * @function getProductById
 * @description Retrieves a single product by ID with all details.
 *
 * @steps
 * 1. Validate that the product ID is a valid MongoDB ObjectId.
 * 2. Query for the product record.
 * 3. Return 404 if not found, otherwise return the product details.
 *
 * @param {Request} req - Request with productId in route parameters.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the product details response.
 */
export const getProductById = asyncHandler(
  async (req: AuthenticatedRequest<{ id: string }, ProductResponse>, res: Response<ProductResponse>, next: NextFunction) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid product id', 400));
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      next(new AppError('Product not found', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      product,
    });
  }
);

/**
 * @function getBestSeller
 * @description Retrieves the best-selling product (highest rating).
 *
 * @steps
 * 1. Query products sorted by rating in descending order.
 * 2. Limit to the top 1 result.
 * 3. Return the best seller or null if no products exist.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the best seller product response.
 */
export const getBestSeller = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const bestSeller = await Product.findOne({ isPublished: true }).sort({ rating: -1 });

  res.status(200).json({
    status: 'success',
    bestSeller,
  });
});

/**
 * @function getNewArrivals
 * @description Retrieves recently added published products for homepage discovery.
 *
 * @steps
 * 1. Query only published products.
 * 2. Sort by newest first.
 * 3. Limit results for homepage performance.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the new arrivals response.
 */
export const getNewArrivals = asyncHandler(async (_req: AuthenticatedRequest, res: Response<NewArrivalsResponse>, _next: NextFunction) => {
  const newArrivals = await Product.find({ isPublished: true }).sort({ createdAt: -1 }).limit(8);

  res.status(200).json({
    status: 'success',
    newArrivals,
  });
});

/**
 * @function getSimilarProducts
 * @description Retrieves products similar to a given product based on category, gender, and collection.
 *
 * @steps
 * 1. Validate the product ID and fetch the target product.
 * 2. Find products matching category, gender, or collection (but not the same product).
 * 3. Limit to 6 similar products for recommendation display.
 * 4. Return the similar products list.
 *
 * @param {Request} req - Request with productId in route parameters.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the similar products response.
 */
export const getSimilarProducts = asyncHandler(
  async (req: AuthenticatedRequest<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(new AppError('Invalid product id', 400));
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      next(new AppError('Product not found', 404));
      return;
    }

    const similarProducts = await Product.find({
      $and: [
        { _id: { $ne: id } },
        { isPublished: true },
        {
          $or: [{ category: product.category }, { gender: product.gender }, { collections: product.collections }],
        },
      ],
    }).limit(6);

    res.status(200).json({
      status: 'success',
      similarProducts,
    });
  }
);

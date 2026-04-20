import type { NextFunction, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { ICart } from '../types/cart';
import type { AuthenticatedRequest } from '../types/http';

/**
 * @fileoverview Shopping cart controller for add/remove/merge and guest-to-user workflows.
 */

/**
 * @function makeKey
 * @description Creates a unique identifier for a cart item variant based on product, size, and color.
 *
 * @steps
 * 1. Convert the product ObjectId to a string for stable comparison.
 * 2. Include size and color as part of the key (use empty string if missing).
 * 3. Return a dash-separated key for deduplication during merge operations.
 *
 * @param {Object} item - The cart item with productId, size, color.
 * @returns {string} Unique variant key for the item.
 */
function makeKey(item: any): string {
  return `${item.productId.toString()}-${item.size || ''}-${item.color || ''}`;
}

interface AddToCartResponse {
  status: 'success';
  guestId: string | null;
  cart: ICart;
}

interface CartResponse {
  status: 'success';
  cart: ICart | { products: never[]; totalPrice: number };
}

interface MergeGuestCartResponse {
  status: 'success';
  message: string;
  cart: ICart | { products: never[]; totalPrice: number };
}

/**
 * @function addToCart
 * @description Adds a product variant to the cart or increments its quantity if it already exists.
 *
 * @steps
 * 1. Validate that the product exists and is published in the catalog.
 * 2. Generate or use the provided guestId for guest tracking.
 * 3. Find or create the cart for the user/guest.
 * 4. Check for existing item variant and increment or create new.
 * 5. Recalculate the cart total and persist.
 *
 * @param {Request} req - Cart operation request with product and quantity data.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the updated cart response.
 */
export const addToCart = asyncHandler(
  async (
    req: AuthenticatedRequest<never, AddToCartResponse, { productId: string; quantity?: number; size?: string; color?: string; guestId?: string; userId?: string }>,
    res: Response<AddToCartResponse>,
    next: NextFunction
  ) => {
    const { productId, quantity = 1, size, color, guestId, userId } = req.body;

    // Step 1: Validate product existence and publish status
    const product = await Product.findById(productId);

    if (!product) {
      next(new AppError('Product not found', 404));
      return;
    }

    if (!product.isPublished) {
      next(new AppError('Product is not available', 400));
      return;
    }

    // Step 2: Handle guest ID creation
    let finalGuestId = guestId;
    if (!finalGuestId && !userId) {
      finalGuestId = `guest_${Date.now()}`;
    }

    // Step 3: Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (finalGuestId) {
      cart = await Cart.findOne({ guestId: finalGuestId });
    }

    if (!cart) {
      cart = new Cart({
        user: userId || undefined,
        guestId: userId ? undefined : finalGuestId,
        products: [],
        totalPrice: 0,
      });
    }

    // Step 4: Check existing item and add or increment
    const existingItem = cart.products.find(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.products.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.discountPrice || product.price,
        size,
        color,
        quantity,
      });
    }

    // Step 5: Recalculate and save
    cart.totalPrice = cart.products.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
    await cart.save();

    res.status(200).json({
      status: 'success',
      guestId: cart.guestId || null,
      cart,
    });
  }
);

/**
 * @function deleteFromCart
 * @description Removes a specific product variant from the cart by productId, size, and color.
 *
 * @steps
 * 1. Validate the product ID is provided and find the cart.
 * 2. Filter out the matching product variant.
 * 3. Return 404 if the item was not in the cart.
 * 4. Recalculate the cart total and persist.
 *
 * @param {Request} req - Delete request with product variant identifiers.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the updated cart response.
 */
export const deleteFromCart = asyncHandler(
  async (
    req: AuthenticatedRequest<
      never,
      CartResponse,
      { productId: string; color?: string; size?: string; userId?: string; guestId?: string }
    >,
    res: Response<CartResponse>,
    next: NextFunction
  ) => {
    const { productId, color, size, userId, guestId } = req.body;

    // Step 1: Validate and find cart
    if (!productId) {
      next(new AppError('Product ID is required', 400));
      return;
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    } else {
      next(new AppError('Guest ID or User ID is required', 400));
      return;
    }

    if (!cart) {
      next(new AppError('Cart not found!', 404));
      return;
    }

    // Step 2 & 3: Remove product and verify
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(
      (item) => !(item.productId.toString() === productId && item.size === size && item.color === color)
    );

    if (cart.products.length === initialLength) {
      next(new AppError('Product not found in cart!', 404));
      return;
    }

    // Step 4: Recalculate and save
    cart.totalPrice = cart.products.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
    await cart.save();

    res.status(200).json({
      status: 'success',
      cart,
    });
  }
);

/**
 * @function getCart
 * @description Retrieves a cart by user ID or guest ID, returning an empty cart structure if not found.
 *
 * @steps
 * 1. Validate that either userId or guestId is provided.
 * 2. Query for the cart using the provided identifier.
 * 3. Return empty cart structure if not found instead of 404.
 *
 * @param {Request} req - Query parameters for userId or guestId.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the cart response.
 */
export const getCart = asyncHandler(
  async (
    req: AuthenticatedRequest<never, CartResponse, never, { userId?: string; guestId?: string }>,
    res: Response<CartResponse>,
    next: NextFunction
  ) => {
    const { userId, guestId } = req.query as Record<string, string>;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    } else {
      next(new AppError('Guest ID or User ID is required', 400));
      return;
    }

    if (!cart) {
      res.status(200).json({
        status: 'success',
        cart: {
          products: [],
          totalPrice: 0,
        },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      cart,
    });
  }
);

/**
 * @function mergeGuestCart
 * @description Merges a guest's cart into a newly authenticated user's cart.
 *
 * @steps
 * 1. Fetch both guest and user cart records.
 * 2. If no guest cart or it's empty, return the user's cart or create one.
 * 3. If user has no cart, convert guest cart to user ownership.
 * 4. If both exist, merge items using a map for O(1) duplicate detection.
 * 5. Delete the guest cart and return the merged user cart.
 *
 * @param {Request} req - Merge request with guestId from the authenticated user context.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the merged cart response.
 */
export const mergeGuestCart = asyncHandler(
  async (req: AuthenticatedRequest<never, MergeGuestCartResponse, { guestId: string }>, res: Response<MergeGuestCartResponse>, next: NextFunction) => {
    const { guestId } = req.body;
    const userId = req.user?._id;

    if (!guestId || !userId) {
      next(new AppError('Both Guest ID and User ID are required!', 400));
      return;
    }

    // Step 1: Fetch carts
    const guestCart = await Cart.findOne({ guestId });
    let userCart = await Cart.findOne({ user: userId });

    // Step 2: Handle missing/empty guest cart
    if (!guestCart) {
      res.status(200).json({
        status: 'success',
        message: 'No guest cart to merge',
        cart: userCart || {
          products: [],
          totalPrice: 0,
        },
      });
      return;
    }

    if (guestCart.products.length === 0) {
      await guestCart.deleteOne();
      res.status(200).json({
        status: 'success',
        message: 'No products in guest cart to merge, so guest cart deleted permanently',
        cart: userCart || {
          products: [],
          totalPrice: 0,
        },
      });
      return;
    }

    // Step 3: Convert guest cart if user has none
    if (!userCart) {
      guestCart.user = userId;
      guestCart.guestId = undefined;
      await guestCart.save();
      res.status(200).json({
        status: 'success',
        message: 'Guest cart merged successfully',
        cart: guestCart,
      });
      return;
    }

    // Step 4: Merge both carts
    const userItemMap = new Map(userCart.products.map((item) => [makeKey(item), item]));
    let totalPrice = userCart.totalPrice || 0;

    guestCart.products.forEach((guestItem) => {
      const key = makeKey(guestItem);
      const existingItem = userItemMap.get(key);
      const itemPrice = Number(guestItem.price) || 0;

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
        totalPrice += itemPrice * guestItem.quantity;
      } else {
        userCart!.products.push(guestItem);
        totalPrice += itemPrice * guestItem.quantity;
        userItemMap.set(key, guestItem);
      }
    });

    userCart.totalPrice = totalPrice;
    await userCart.save();

    // Step 5: Delete guest cart
    await guestCart.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Guest cart merged successfully',
      cart: userCart,
    });
  }
);

/**
 * @function updateCartQuantity
 * @description Updates the quantity of a specific product variant in the cart.
 *
 * @steps
 * 1. Validate that user/guestId and product variant identifiers are provided.
 * 2. Find the cart for the user/guest.
 * 3. Find the product item variant by productId, size, and color.
 * 4. Update the quantity and recalculate the cart total.
 * 5. Return the updated cart.
 *
 * @param {Request} req - Update request with cart owner and product variant details.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the updated cart response.
 */
export const updateCartQuantity = asyncHandler(
  async (
    req: AuthenticatedRequest<
      never,
      CartResponse,
      { productId: string; quantity: number; color?: string; size?: string; userId?: string; guestId?: string }
    >,
    res: Response<CartResponse>,
    next: NextFunction
  ) => {
    const { productId, quantity, color, size, userId, guestId } = req.body;

    if (quantity < 1) {
      next(new AppError('Quantity must be at least 1', 400));
      return;
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (guestId) {
      cart = await Cart.findOne({ guestId });
    } else {
      next(new AppError('Guest ID or User ID is required', 400));
      return;
    }

    if (!cart) {
      next(new AppError('Cart not found', 404));
      return;
    }

    const item = cart.products.find(
      (p) => p.productId.toString() === productId && p.size === size && p.color === color
    );

    if (!item) {
      next(new AppError('Product not found in cart', 404));
      return;
    }

    item.quantity = quantity;
    cart.totalPrice = cart.products.reduce((total, p) => total + Number(p.price) * p.quantity, 0);

    await cart.save();

    res.status(200).json({
      status: 'success',
      cart,
    });
  }
);

import { Router } from 'express';
import { addToCart, deleteFromCart, getCart, mergeGuestCart, updateCartQuantity } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

/**
 * @fileoverview Cart routes for add/remove/merge and guest-to-user workflows.
 */

const router = Router();

/**
 * @route POST /api/cart
 * @description Adds a product to the cart or increments quantity if it exists.
 * @access Public/Private (supports both guest and authenticated)
 */
router.post('/', addToCart);

/**
 * @route DELETE /api/cart
 * @description Removes a specific product variant from the cart.
 * @access Public/Private
 */
router.delete('/', deleteFromCart);

/**
 * @route PUT /api/cart
 * @description Updates the quantity of a product in the cart.
 * @access Public/Private
 */
router.put('/', updateCartQuantity);

/**
 * @route GET /api/cart
 * @description Retrieves a cart by userId or guestId.
 * @access Public/Private
 */
router.get('/', getCart);

/**
 * @route POST /api/cart/merge
 * @description Merges a guest cart into an authenticated user's cart.
 * @access Private
 */
router.post('/merge', protect, mergeGuestCart);

export default router;

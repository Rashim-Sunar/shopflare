import { Router } from 'express';
import { createCheckout, payCheckout, finalizeCheckout } from '../controllers/checkoutController';
import { protect } from '../middleware/authMiddleware';

/**
 * @fileoverview Checkout routes for payment processing and order finalization.
 */

const router = Router();

/**
 * @route POST /api/checkout
 * @description Creates a new checkout from cart items and shipping address.
 * @access Private
 */
router.post('/', protect, createCheckout);

/**
 * @route PATCH /api/checkout/:id/pay
 * @description Updates checkout payment status after successful payment.
 * @access Private
 */
router.patch('/:id/pay', protect, payCheckout);

/**
 * @route POST /api/checkout/:id/finalize
 * @description Converts a paid checkout into an Order and clears the cart.
 * @access Private
 */
router.post('/:id/finalize', protect, finalizeCheckout);

export default router;

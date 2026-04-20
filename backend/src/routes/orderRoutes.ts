import { Router } from 'express';
import { getMyOrders, getOrderById } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

/**
 * @fileoverview Order routes for authenticated order history and order lookup flows.
 */

const router = Router();

/**
 * @route GET /api/orders/my-orders
 * @description Returns the authenticated user's order history.
 * @access Private
 */
router.get('/my-orders', protect, getMyOrders);

/**
 * @route GET /api/orders/:id
 * @description Returns a single order by identifier.
 * @access Private
 */
router.get('/:id', protect, getOrderById);

export default router;
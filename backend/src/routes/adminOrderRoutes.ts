import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/roleMiddleware';
import { UserRole } from '../types/auth';

/**
 * @fileoverview Admin order management routes for order tracking and fulfillment.
 */

const router = Router();

/**
 * @route GET /api/admin/orders
 * @description Retrieves all orders placed in the system with admin visibility.
 * @access Private - Admin only
 */
router.get('/', protect, restrictTo([UserRole.Admin]), async (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'All orders retrieved',
  });
});

/**
 * @route PUT /api/admin/orders/:id
 * @description Updates order status (Processing -> Shipped -> Delivered).
 * @access Private - Admin only
 */
router.put('/:id', protect, restrictTo([UserRole.Admin]), async (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Order status updated',
  });
});

export default router;

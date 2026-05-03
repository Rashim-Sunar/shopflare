import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/roleMiddleware';
import { UserRole } from '../types/auth';
import Order from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * @fileoverview Admin order management routes for order tracking and fulfillment.
 */

const router = Router();

/**
 * @route GET /api/admin/orders
 * @description Retrieves all orders placed in the system with admin visibility.
 * @access Private - Admin only
 */
router.get(
  '/',
  protect,
  restrictTo([UserRole.Admin]),
  asyncHandler(async (_req, res) => {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      orders,
    });
  })
);

/**
 * @route PUT /api/admin/orders/:id
 * @description Updates order status (Processing -> Shipped -> Delivered).
 * @access Private - Admin only
 */
router.put(
  '/:id',
  protect,
  restrictTo([UserRole.Admin]),
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body as { status?: string };

    const order = await Order.findById(id);
    if (!order) {
      next(new AppError('Order not found', 404));
      return;
    }

    if (status) {
      order.status = status as any;
    }
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Order status updated',
      updatedOrder: order,
    });
  })
);

export default router;

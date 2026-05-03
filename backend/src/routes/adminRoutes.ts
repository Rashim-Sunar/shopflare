import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/roleMiddleware';
import { UserRole } from '../types/auth';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * @fileoverview Admin user management routes (CRUD operations on users).
 */

const router = Router();

/**
 * @route GET /api/admin/users
 * @description Retrieves all users in the system.
 * @access Private - Admin only
 */
router.get(
  '/users',
  protect,
  restrictTo([UserRole.Admin]),
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      users,
    });
  })
);

/**
 * @route PUT /api/admin/users/:id
 * @description Updates user information (role, status, etc).
 * @access Private - Admin only
 */
router.put(
  '/users/:id',
  protect,
  restrictTo([UserRole.Admin]),
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body as { role?: string };

    const user = await User.findById(id);
    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      user.role = role as UserRole;
    }
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      user,
    });
  })
);

/**
 * @route DELETE /api/admin/users/:id
 * @description Deletes a user from the system.
 * @access Private - Admin only
 */
router.delete(
  '/users/:id',
  protect,
  restrictTo([UserRole.Admin]),
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  })
);

export default router;

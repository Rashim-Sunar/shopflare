import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/roleMiddleware';
import { UserRole } from '../types/auth';

/**
 * @fileoverview Admin user management routes (CRUD operations on users).
 */

const router = Router();

/**
 * @route GET /api/admin/users
 * @description Retrieves all users in the system.
 * @access Private - Admin only
 */
router.get('/users', protect, restrictTo([UserRole.Admin]), async (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin user management endpoint',
  });
});

/**
 * @route PUT /api/admin/users/:id
 * @description Updates user information (role, status, etc).
 * @access Private - Admin only
 */
router.put('/users/:id', protect, restrictTo([UserRole.Admin]), async (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
  });
});

/**
 * @route DELETE /api/admin/users/:id
 * @description Deletes a user from the system.
 * @access Private - Admin only
 */
router.delete('/users/:id', protect, restrictTo([UserRole.Admin]), async (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

export default router;

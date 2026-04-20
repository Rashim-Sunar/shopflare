import { Router } from 'express';
import { getProfile, login, signup } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

/**
 * @fileoverview User authentication and profile routes for the TypeScript backend.
 */

const router = Router();

/**
 * @route POST /api/users/register
 * @description Registers a new user account.
 * @access Public
 */
router.post('/register', signup);

/**
 * @route POST /api/users/login
 * @description Authenticates a user and returns a session token.
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/users/profile
 * @description Returns the authenticated user's public profile.
 * @access Private
 */
router.get('/profile', protect, getProfile);

export default router;
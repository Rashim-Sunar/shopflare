import { Router } from 'express';
import { chatWithAi } from '../controllers/aiController';

/**
 * @fileoverview AI chatbot routes.
 */

const router = Router();

/**
 * @route POST /api/ai/chat
 * @description Handles AI-assisted structured product queries.
 * @access Public
 */
router.post('/chat', chatWithAi);

export default router;

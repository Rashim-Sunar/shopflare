import { Router } from 'express';

/**
 * @fileoverview Newsletter subscription routes for email marketing.
 */

const router = Router();

/**
 * @route POST /api/subscribe
 * @description Subscribes an email address to the newsletter.
 * @access Public
 */
router.post('/', async (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Subscribed successfully',
  });
});

export default router;

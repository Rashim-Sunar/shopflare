import type { AuthenticatedUser } from './auth';

/**
 * @fileoverview Express request augmentation for authenticated user data.
 */

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
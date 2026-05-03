import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthenticatedRequest } from '../types/http';
import type { UserRole } from '../types/auth';

/**
 * @fileoverview Authorization middleware that restricts access to specific user roles.
 */

/**
 * @function restrictTo
 * @description Creates a role-based authorization guard for protected routes.
 *
 * 1. Receive the list of roles allowed to access the route.
 * 2. Ensure authentication already populated req.user.
 * 3. Block requests whose role does not match the allowed list.
 *
 * @param {ReadonlyArray<UserRole>} allowedRoles - Roles permitted to access the route.
 * @returns {Function} An Express middleware that enforces the role restriction.
 */
export function restrictTo(allowedRoles: ReadonlyArray<UserRole>) {
  return asyncHandler(async (req: AuthenticatedRequest, res, next) => {
    void res;

    // Step 1: Ensure the protect middleware has already attached the user.
    if (!req.user) {
      next(new AppError('User not authenticated', 401));
      return;
    }

    // Step 2: Compare the current role with the allowed set.
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role).trim().toLowerCase());
    const currentRole = String(req.user.role).trim().toLowerCase();

    if (!normalizedAllowedRoles.includes(currentRole)) {
      next(new AppError('You do not have permission to perform this action', 403));
      return;
    }

    next();
  });
}
import jwt from 'jsonwebtoken';
import type { NextFunction, Response } from 'express';
import User from '../models/User';
import { appEnv } from '../config/env';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AuthTokenPayload, AuthenticatedUser } from '../types/auth';
import type { AuthenticatedRequest } from '../types/http';

/**
 * @fileoverview Authentication middleware that resolves bearer tokens into typed user context.
 */

/**
 * @function protect
 * @description Verifies the bearer token, loads the user, and attaches a safe user payload to the request.
 */
export const protect = asyncHandler(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {

  // Step 1: Read the bearer token from the Authorization header.
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader?.startsWith('Bearer ') ? authorizationHeader.split(' ')[1] : undefined;

  if (!token) {
    next(new AppError('You are not logged in. Please login first', 401));
    return;
  }

  // Step 2: Verify the token with the server-side secret.
  let decodedToken: AuthTokenPayload;

  try {
    decodedToken = jwt.verify(token, appEnv.secretStr) as AuthTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('JWT has expired. Please login again!', 401));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please login again!', 401));
      return;
    }

    throw error;
  }

  const userId = decodedToken.id ?? decodedToken._id;

  if (!userId) {
    next(new AppError('Invalid token payload. Please login again.', 401));
    return;
  }

  // Step 3: Load the current user and reject missing or stale sessions.
  const user = await User.findById(userId).select('+password passwordChangedAt role');

  if (!user) {
    next(new AppError('The user with the given token does not exist.', 401));
    return;
  }

  console.log('🔐 Debug - User from DB:', {
    userId: user._id,
    hasEmail: !!user.email,
    hasRole: !!user.role,
    roleValue: user.role,
    roleType: typeof user.role,
  });

  console.log('🔐 Debug - User from DB:', {
    userId: user._id,
    hasEmail: !!user.email,
    hasRole: !!user.role,
    roleValue: user.role,
    roleType: typeof user.role,
  });

  const tokenIssuedAt = decodedToken.iat ?? 0;
  const passwordChanged = await user.isPasswordChanged(tokenIssuedAt);

  if (passwordChanged) {
    next(new AppError('Password recently changed. Please login again!', 401));
    return;
  }

  // Step 4: Expose only the minimal safe user profile to downstream handlers.
  const userRole = user.role || 'customer';
  const normalizedRole = String(userRole).trim().toLowerCase();

  const authenticatedUser: AuthenticatedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: normalizedRole as AuthenticatedUser['role'],
  };

  req.user = authenticatedUser;
  next();
});
import jwt from 'jsonwebtoken';
import type { NextFunction, Response } from 'express';
import User from '../models/User';
import { appEnv } from '../config/env';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type {
  AuthResponse,
  LoginRequestBody,
  SignupRequestBody,
  UserRole,
} from '../types/auth';
import type { AuthenticatedRequest } from '../types/http';

/**
 * @fileoverview Authentication controller for registration, login, and profile retrieval.
 */

interface ProfileResponse {
  status: 'success';
  user: NonNullable<AuthenticatedRequest['user']>;
}

/**
 * @function signToken
 * @description Builds a signed JWT for an authenticated user session.
 *
 * @steps
 * 1. Accept the user's id and role as the token payload.
 * 2. Sign the payload with the validated application secret.
 * 3. Apply the configured expiration window so sessions stay bounded.
 *
 * @param {string} id - The user identifier to place in the token.
 * @param {UserRole} role - The user's role for downstream authorization.
 * @returns {string} Signed JWT string.
 */
function signToken(id: string, role: UserRole): string {
  const signOptions: jwt.SignOptions = {
    expiresIn: appEnv.expiringDay as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign({ id, role }, appEnv.secretStr, signOptions);
}

/**
 * @function buildAuthResponse
 * @description Maps a user document into the public authentication response contract.
 *
 * @steps
 * 1. Convert the database identifier into a serializable string.
 * 2. Copy only the fields the client should see.
 * 3. Return a response object that is stable and easy to test.
 *
 * @param {{ _id: string; name: string; email: string; role: UserRole }} user - Public user projection.
 * @param {string} token - Signed session token.
 * @returns {AuthResponse} Typed authentication response payload.
 */
function buildAuthResponse(user: { _id: string; name: string; email: string; role: UserRole }, token: string): AuthResponse {
  return {
    status: 'success',
    token,
    user,
  };
}

/**
 * @function signup
 * @description Registers a new user account and returns a signed session token.
 *
 * @steps
 * 1. Validate the incoming registration payload.
 * 2. Check whether the email already exists before writing anything.
 * 3. Persist the new user, sign a token, and return a minimal public profile.
 *
 * @param {Request} req - The incoming registration request.
 * @param {Response<AuthResponse>} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the created account response.
 */
export const signup = asyncHandler(async (req: AuthenticatedRequest<never, AuthResponse, SignupRequestBody>, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    next(new AppError('Please provide name, email, and password.', 400));
    return;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    next(new AppError('User already exists', 400));
    return;
  }

  const createdUser = await User.create({ name, email, password });
  const token = signToken(createdUser._id.toString(), createdUser.role);

  res.status(201).json(
    buildAuthResponse(
      {
        _id: createdUser._id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      token
    )
  );
});

/**
 * @function login
 * @description Authenticates an existing user and returns a signed session token.
 *
 * @steps
 * 1. Validate the login credentials and reject missing values early.
 * 2. Load the stored password hash so bcrypt can compare it safely.
 * 3. Issue a new JWT when the credentials are valid and return the public profile.
 *
 * @param {Request} req - The incoming login request.
 * @param {Response<AuthResponse>} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the authenticated session response.
 */
export const login = asyncHandler(async (req: AuthenticatedRequest<never, AuthResponse, LoginRequestBody>, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide email ID and password for login!', 400));
    return;
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    next(new AppError('Invalid credentials.', 400));
    return;
  }

  const passwordMatches = await user.matchPassword(password);

  if (!passwordMatches) {
    next(new AppError('Invalid credentials.', 400));
    return;
  }

  const token = signToken(user._id.toString(), user.role);

  res.status(200).json(
    buildAuthResponse(
      {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token
    )
  );
});

/**
 * @function getProfile
 * @description Returns the authenticated user payload that protect middleware attached.
 *
 * @steps
 * 1. Verify that the auth middleware already populated req.user.
 * 2. Reject unauthenticated requests with a typed operational error.
 * 3. Return the safe user projection without exposing internal account fields.
 *
 * @param {Request} req - The authenticated request.
 * @param {Response<ProfileResponse>} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends the current user profile.
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response<ProfileResponse>, next: NextFunction) => {
  if (!req.user) {
    next(new AppError('User not authenticated', 401));
    return;
  }

  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});
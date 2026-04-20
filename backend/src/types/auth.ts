import type { Types } from 'mongoose';

/**
 * @fileoverview Shared authentication types used across controllers, middleware, and routes.
 */

export enum UserRole {
  Customer = 'customer',
  Admin = 'admin',
}

export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  id?: string;
  _id?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  status: 'success';
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
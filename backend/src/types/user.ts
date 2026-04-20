import type { HydratedDocument, Model } from 'mongoose';
import type { UserRole } from './auth';

/**
 * @fileoverview User domain types and Mongoose document contracts.
 */

export interface IUser {
  name: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  isPasswordChanged(jwtIssuedAt: number): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export interface UserModel extends Model<IUser, Record<string, never>, IUserMethods> {}
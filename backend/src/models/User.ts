import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import validator from 'validator';
import type { IUser, IUserMethods, UserDocument, UserModel } from '../types/user';
import { UserRole } from '../types/auth';

/**
 * @fileoverview Typed User model with password hashing and JWT invalidation helpers.
 */

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name!'],
      minlength: [3, 'Name must be at least 3 characters.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Enter your email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Enter your password.'],
      minlength: [5, 'Password must be atleast 5 characters long.'],
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.Customer,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @function hashPasswordBeforeSave
 * @description Hashes a user password only when the password field has changed.
 *
 * @steps
 * 1. Skip hashing when the password has not been modified.
 * 2. Hash the password with a fixed cost factor before persisting it.
 * 3. Update passwordChangedAt so existing JWTs can be invalidated after password updates.
 *
 * @returns {Promise<void>} Signals completion to the Mongoose save lifecycle.
 */
userSchema.pre('save', async function hashPasswordBeforeSave(this: UserDocument) {
  if (!this.isModified('password')) {
    return;
  }

  // Step 1: Hash the password before it reaches the database.
  this.password = await bcrypt.hash(this.password, 12);

  // Step 2: Mark the password change time so token freshness checks can work reliably.
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});

/**
 * @function matchPassword
 * @description Compares a plain-text password against the stored hash.
 *
 * @steps
 * 1. Receive the candidate password from the login flow.
 * 2. Delegate the hash comparison to bcrypt.
 * 3. Return a boolean so callers can reject invalid credentials cleanly.
 *
 * @param {string} enteredPassword - Plain-text password supplied by the user.
 * @returns {Promise<boolean>} Whether the password matches the stored hash.
 */
userSchema.methods.matchPassword = async function matchPassword(this: UserDocument, enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * @function isPasswordChanged
 * @description Checks whether the password was updated after the provided JWT was issued.
 *
 * @steps
 * 1. Read the stored passwordChangedAt timestamp.
 * 2. Convert the timestamp to JWT-compatible seconds.
 * 3. Return true when the token was issued before the last password update.
 *
 * @param {number} jwtIssuedAt - Token issued-at timestamp in seconds.
 * @returns {Promise<boolean>} Whether the password changed after the token was issued.
 */
userSchema.methods.isPasswordChanged = async function isPasswordChanged(
  this: UserDocument,
  jwtIssuedAt: number
): Promise<boolean> {
  if (!this.passwordChangedAt) {
    return false;
  }

  const passwordChangedSeconds = Math.trunc(this.passwordChangedAt.getTime() / 1000);
  return jwtIssuedAt < passwordChangedSeconds;
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
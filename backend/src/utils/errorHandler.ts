import type { ErrorRequestHandler } from 'express';
import { AppError } from './AppError';
import { appEnv } from '../config/env';

/**
 * @fileoverview Centralized, typed error middleware for development and production flows.
 */

interface MongooseValidationIssue {
  message: string;
}

type ErrorWithAppFields = Error & {
  statusCode?: number;
  status?: 'fail' | 'error';
  isOperational?: boolean;
  name?: string;
  code?: number;
  path?: string;
  value?: unknown;
  errors?: Record<string, MongooseValidationIssue>;
  keyValue?: Record<string, string>;
};

function formatDevelopmentError(res: Parameters<ErrorRequestHandler>[2], error: ErrorWithAppFields): void {
  res.status(error.statusCode ?? 500).json({
    status: error.status ?? 'error',
    message: error.message,
    stackTrace: error.stack,
    error,
  });
}

function formatProductionError(res: Parameters<ErrorRequestHandler>[2], error: ErrorWithAppFields): void {
  if (error.isOperational) {
    res.status(error.statusCode ?? 500).json({
      status: error.status ?? 'error',
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: 'Seems like something went wrong. Please try later!',
  });
}

function castErrorHandler(error: ErrorWithAppFields): AppError {
  const path = error.path ?? 'field';
  const value = String(error.value ?? 'unknown');
  return new AppError(`Invalid value for ${path}: ${value} !`, 400);
}

function duplicateKeyErrorHandler(error: ErrorWithAppFields): AppError {
  const conflictingValue = error.keyValue ? Object.values(error.keyValue).join(', ') : 'duplicate value';
  return new AppError(`A record with value ${conflictingValue} already exists. Please use another value!`, 400);
}

function validationErrorHandler(error: ErrorWithAppFields): AppError {
  const messages = error.errors ? Object.values(error.errors).map((issue) => issue.message) : ['Validation failed'];
  return new AppError(`Invalid input data: ${messages.join('. ')}`, 400);
}

function handleExpiredJWT(): AppError {
  return new AppError('JWT has expired. Please login again!', 401);
}

function handleJWTError(): AppError {
  return new AppError('Invalid token. Please login again!', 401);
}

/**
 * @function globalErrorHandler
 * @description Normalizes framework and database errors into a consistent HTTP response shape.
 *
 * @steps
 * 1. Normalize the incoming error into a typed operational error shape.
 * 2. Apply environment-specific formatting so development exposes stack traces while production stays safe.
 * 3. Map common Mongoose and JWT failures into user-friendly operational errors.
 *
 * @param {unknown} error - The thrown or forwarded error object.
 * @param {Request} req - The current Express request.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void} Sends the final error response.
 */
export const globalErrorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  void req;
  void next;

  const normalizedError = (error instanceof Error ? error : new Error('Unknown error')) as ErrorWithAppFields;
  normalizedError.statusCode = normalizedError.statusCode ?? 500;
  normalizedError.status = normalizedError.status ?? 'error';

  if (appEnv.nodeEnv === 'development') {
    formatDevelopmentError(res, normalizedError);
    return;
  }

  let operationalError = normalizedError;

  if (operationalError.name === 'CastError') {
    operationalError = castErrorHandler(operationalError);
  }

  if (operationalError.code === 11000) {
    operationalError = duplicateKeyErrorHandler(operationalError);
  }

  if (operationalError.name === 'ValidationError') {
    operationalError = validationErrorHandler(operationalError);
  }

  if (operationalError.name === 'TokenExpiredError') {
    operationalError = handleExpiredJWT();
  }

  if (operationalError.name === 'JsonWebTokenError') {
    operationalError = handleJWTError();
  }

  formatProductionError(res, operationalError);
};
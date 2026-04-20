import dotenv from 'dotenv';

/**
 * @fileoverview Centralized environment validation for the backend runtime.
 */

dotenv.config();

export interface AppEnv {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  mongoUri: string;
  secretStr: string;
  expiringDay: string;
}

function readRequiredEnv(key: 'MONGO_URI' | 'SECRET_STR' | 'EXPIRING_DAY'): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * @function getAppEnv
 * @description Reads, validates, and normalizes the environment variables used by the server.
 *
 * @steps
 * 1. Read required variables from process.env and fail fast if any are missing.
 * 2. Normalize optional values like PORT and NODE_ENV into typed runtime values.
 * 3. Return a single config object so the rest of the app does not touch raw process.env.
 *
 * @returns {AppEnv} Strongly typed application environment settings.
 */
export function getAppEnv(): AppEnv {
  const rawPort = process.env.PORT ?? '3000';
  const parsedPort = Number.parseInt(rawPort, 10);

  return {
    nodeEnv: (process.env.NODE_ENV ?? 'development') as AppEnv['nodeEnv'],
    port: Number.isNaN(parsedPort) ? 3000 : parsedPort,
    mongoUri: readRequiredEnv('MONGO_URI'),
    secretStr: readRequiredEnv('SECRET_STR'),
    expiringDay: readRequiredEnv('EXPIRING_DAY'),
  };
}

export const appEnv = getAppEnv();
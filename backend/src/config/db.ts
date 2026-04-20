import mongoose from 'mongoose';
import { appEnv } from './env';

/**
 * @fileoverview Mongoose connection bootstrap for the TypeScript backend.
 */

/**
 * @function connectDB
 * @description Establishes a single MongoDB connection for the application process.
 *
 * @steps
 * 1. Read the validated MongoDB connection string from the environment layer.
 * 2. Open a Mongoose connection with production-safe defaults.
 * 3. Log the connection status so operational issues are visible during startup.
 *
 * @returns {Promise<typeof mongoose>} The connected Mongoose instance.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const connection = await mongoose.connect(appEnv.mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}
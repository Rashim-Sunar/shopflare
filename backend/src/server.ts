import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { appEnv } from './config/env';
import { connectDB } from './config/db';
import { globalErrorHandler } from './utils/errorHandler';
import { AppError } from './utils/AppError';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import cartRoutes from './routes/cartRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import productRoutes from './routes/productRoutes';
import productAdminRoutes from './routes/productAdminRoutes';
import adminRoutes from './routes/adminRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import uploadRoutes from './routes/uploadRoutes';
import subscribeRoutes from './routes/subscribeRoute';

/**
 * @fileoverview TypeScript entrypoint that bootstraps the Express server, routes, and database connection.
 */

const app = express();

/**
 * @function registerMiddleware
 * @description Applies the global middleware stack before routes are mounted.
 *
 * @steps
 * 1. Enable JSON parsing so request bodies are available to controllers.
 * 2. Enable CORS for the frontend integration point.
 * 3. Keep the middleware stack minimal and explicit so request flow is easy to reason about.
 *
 * @returns {void} Configures the Express app in place.
 */
function registerMiddleware(): void {
  app.use(express.json());
  app.use(cors());
}

/**
 * @function registerRoutes
 * @description Mounts application routes and the 404 fallback handler.
 *
 * @steps
 * 1. Register public and protected API route groups.
 * 2. Define a catch-all 404 handler for unmapped requests.
 * 3. Hand final errors to the global error middleware.
 *
 * @returns {void} Configures the route layer in place.
 */
function registerRoutes(): void {
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).send('Hello world');
  });

  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/admin/products', productAdminRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin/orders', adminOrderRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/subscribe', subscribeRoutes);

  app.all('*path', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
  });

  app.use(globalErrorHandler);
}

/**
 * @function bootstrapServer
 * @description Initializes the database connection and starts the HTTP server.
 *
 * @steps
 * 1. Register the application middleware and routes.
 * 2. Open the MongoDB connection before accepting traffic.
 * 3. Start listening on the configured port and log the binding location.
 *
 * @returns {Promise<void>} Resolves once the server is ready or rejects on startup failure.
 */
async function bootstrapServer(): Promise<void> {
  registerMiddleware();
  registerRoutes();

  await connectDB();

  app.listen(appEnv.port, () => {
    console.log(`Server listening on port: ${appEnv.port}`);
  });
}

void bootstrapServer().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
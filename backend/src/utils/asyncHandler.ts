import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * @fileoverview Promise-aware wrapper for Express handlers.
 */

type AsyncRequestHandler<
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[] | undefined>,
  Locals extends Record<string, unknown> = Record<string, unknown>
> = (req: Request<Params, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => Promise<unknown>;

/**
 * @function asyncHandler
 * @description Wraps async route handlers and forwards rejected promises to Express error middleware.
 *
 * @steps
 * 1. Accept a standard async Express handler.
 * 2. Execute it and capture any rejected promise.
 * 3. Forward the error to next() so the global error middleware owns the response.
 *
 * @param {AsyncRequestHandler} handler - The async request handler to wrap.
 * @returns {RequestHandler} An Express-compatible request handler.
 */
export function asyncHandler<
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[] | undefined>,
  Locals extends Record<string, unknown> = Record<string, unknown>
>(handler: AsyncRequestHandler<Params, ResBody, ReqBody, ReqQuery, Locals>): RequestHandler<Params, ResBody, ReqBody, ReqQuery, Locals> {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
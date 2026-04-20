import type { Request } from 'express';
import type { AuthenticatedUser } from './auth';

/**
 * @fileoverview HTTP helper types used to keep Express request shapes explicit in controllers and middleware.
 */

export interface AuthenticatedRequest<
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, string | string[] | undefined>
> extends Request<Params, ResBody, ReqBody, ReqQuery, Record<string, unknown>> {
  user?: AuthenticatedUser;
}
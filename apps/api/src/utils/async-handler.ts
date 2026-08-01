import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps asynchronous Express route handlers to catch exceptions and pass them to the next error middleware.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asyncHandler<P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<unknown> | unknown,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

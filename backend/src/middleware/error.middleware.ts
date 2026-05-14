import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { errorResponse } from "../utils/response";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const message = err.errors.map((issue) => issue.message).join(", ");
    return errorResponse(res, message || "Invalid request data", 422);
  }

  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  const message =
    env.NODE_ENV === "production" ? "Something went wrong" : err.message;
  return errorResponse(res, message, 500);
}


import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationErrorDetail } from '../utils/appError';
import env from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: ValidationErrorDetail[] | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 422;
    message = 'Validation failed';
    const mongooseErr = err as Error & { errors?: Record<string, { message: string; path?: string }> };
    if (mongooseErr.errors) {
      errors = Object.values(mongooseErr.errors).map((item) => ({
        field: item.path,
        message: item.message,
      }));
    }
  } else if ('code' in err && (err as { code: number }).code === 11000) {
    // Mongoose duplicate key
    statusCode = 409;
    const mongoDuplicate = err as { keyValue?: Record<string, unknown> };
    const field = mongoDuplicate.keyValue ? Object.keys(mongoDuplicate.keyValue)[0] : 'field';
    message = `${field || 'Field'} already exists.`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  } else if (err.message) {
    message = err.message;
  }

  if (statusCode === 500 && env.NODE_ENV !== 'test') {
    console.error('[Error Handler] Unhandled exception:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
  });
};

export default errorHandler;

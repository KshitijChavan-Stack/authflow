import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/apiResponse.js';

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(messages.join(', '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token has expired', 401);
  }

  // Operational errors (AppError instances)
  if (error.isOperational) {
    return errorResponse(res, error.message, error.statusCode);
  }

  // Programming or unknown errors - don't leak error details
  if (process.env.NODE_ENV === 'development') {
    return errorResponse(res, error.message || 'Something went wrong', error.statusCode || 500);
  }

  return errorResponse(res, 'Internal server error', 500);
};

// Handle 404 routes
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async handler wrapper (eliminates try-catch in controllers)
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

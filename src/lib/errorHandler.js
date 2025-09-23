/**
 * Comprehensive Error Handling System
 * Provides consistent error responses and logging
 */

/**
 * Error types for consistent error handling
 */
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  WORDPRESS_ERROR: 'WORDPRESS_ERROR',
  WOOCOMMERCE_ERROR: 'WOOCOMMERCE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

/**
 * HTTP status codes mapping
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Create standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} error - Error type or details
 * @param {Object} details - Additional error details
 * @returns {Object} Error response
 */
export function createErrorResponse(res, statusCode, message, error = null, details = null) {
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  if (error) {
    errorResponse.error = error;
  }

  if (details) {
    errorResponse.details = details;
  }

  // Log error for monitoring
  logError(statusCode, message, error, details);

  return res.status(statusCode).json(errorResponse);
}

/**
 * Create success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Success response
 */
export function createSuccessResponse(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

/**
 * Log error for monitoring and debugging
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} error - Error type
 * @param {Object} details - Additional details
 */
function logError(statusCode, message, error, details) {
  const logData = {
    level: getLogLevel(statusCode),
    timestamp: new Date().toISOString(),
    statusCode,
    message,
    error,
    details
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error:', logData);
  }

  // In production, you would send this to a logging service
  // like Winston, LogRocket, Sentry, etc.
}

/**
 * Get log level based on status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Log level
 */
function getLogLevel(statusCode) {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Handle async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('🚨 Global error handler:', err);

  // Default error
  let statusCode = HTTP_STATUS.INTERNAL_ERROR;
  let message = 'Internal server error';
  let error = ERROR_TYPES.INTERNAL_ERROR;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    error = ERROR_TYPES.VALIDATION_ERROR;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication required';
    error = ERROR_TYPES.AUTHENTICATION_ERROR;
  } else if (err.name === 'ForbiddenError') {
    statusCode = HTTP_STATUS.FORBIDDEN;
    message = 'Access denied';
    error = ERROR_TYPES.AUTHORIZATION_ERROR;
  } else if (err.name === 'NotFoundError') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = 'Resource not found';
    error = ERROR_TYPES.NOT_FOUND;
  } else if (err.message && err.message.includes('Rate limit')) {
    statusCode = HTTP_STATUS.RATE_LIMITED;
    message = 'Too many requests';
    error = ERROR_TYPES.RATE_LIMIT_ERROR;
  }

  // Use custom error properties if available
  if (err.statusCode) {
    statusCode = err.statusCode;
  }
  if (err.message) {
    message = err.message;
  }
  if (err.type) {
    error = err.type;
  }

  createErrorResponse(res, statusCode, message, error, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

/**
 * Create custom error class
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} type - Error type
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_ERROR, type = ERROR_TYPES.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default {
  createErrorResponse,
  createSuccessResponse,
  asyncHandler,
  globalErrorHandler,
  AppError,
  ERROR_TYPES,
  HTTP_STATUS
};
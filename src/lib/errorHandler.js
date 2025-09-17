/**
 * Enhanced Error Handling Utilities
 * Production-ready error handling with external logging support
 */

import { logger } from './logger.js';

// Safe error messages for different environments
const SAFE_ERROR_MESSAGES = {
  // Authentication errors
  AUTH_ERROR: 'Authentication failed. Please check your credentials.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  
  // API errors
  API_ERROR: 'Service temporarily unavailable. Please try again later.',
  API_NOT_FOUND: 'The requested resource was not found.',
  API_TIMEOUT: 'Request timeout. Please try again.',
  
  // Validation errors
  VALIDATION_ERROR: 'Invalid input provided.',
  REQUIRED_FIELD: 'Required field is missing.',
  INVALID_FORMAT: 'Invalid data format.',
  
  // Rate limiting
  RATE_LIMIT: 'Too many requests. Please try again later.',
  
  // Generic errors
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request.',
  CONFLICT: 'Resource conflict occurred.',
};

// Enhanced error logging with external service support
export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context: {
      ...context,
      // Remove sensitive data from context
      ...(context.body && { body: sanitizeContext(context.body) }),
      ...(context.query && { query: sanitizeContext(context.query) }),
    },
    type: error.constructor.name,
    severity: getErrorSeverity(error),
  };
  
  // Use our logger utility
  logger.error(error.message, error, errorInfo.context);
  
  // Send to external logging service in production
  if (process.env.NODE_ENV === 'production') {
    sendToExternalService(errorInfo);
  }
};

// Determine error severity for better categorization
const getErrorSeverity = (error) => {
  if (error.name === 'ValidationError') return 'low';
  if (error.name === 'AuthenticationError') return 'medium';
  if (error.name === 'DatabaseError') return 'high';
  if (error.name === 'NetworkError') return 'medium';
  return 'medium';
};

// Send to external logging service
const sendToExternalService = async (errorInfo) => {
  try {
    // Example: Send to Sentry
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(errorInfo.error, {
    //     extra: errorInfo.context,
    //     tags: { 
    //       section: errorInfo.context.section,
    //       severity: errorInfo.severity 
    //     }
    //   });
    // }
    
    // Example: Send to custom logging endpoint
    if (process.env.LOGGING_ENDPOINT) {
      await fetch(process.env.LOGGING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo)
      });
    }
  } catch (loggingError) {
    // Fallback to console if external logging fails
    console.error('Failed to send error to external service:', loggingError);
  }
};

// Sanitize context data to remove sensitive information
const sanitizeContext = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'auth', 'authorization',
    'credit', 'card', 'ssn', 'social', 'security', 'pin', 'cvv'
  ];
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeContext(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Create safe error response
export const createErrorResponse = (error, context = {}) => {
  // Log the error securely
  logError(error, context);
  
  // Determine error type and status code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = SAFE_ERROR_MESSAGES.INTERNAL_ERROR;
  
  // Handle specific error types
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        statusCode = 400;
        errorCode = 'BAD_REQUEST';
        message = SAFE_ERROR_MESSAGES.BAD_REQUEST;
        break;
      case 401:
        statusCode = 401;
        errorCode = 'AUTH_ERROR';
        message = SAFE_ERROR_MESSAGES.AUTH_ERROR;
        break;
      case 403:
        statusCode = 403;
        errorCode = 'FORBIDDEN';
        message = SAFE_ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        statusCode = 404;
        errorCode = 'NOT_FOUND';
        message = SAFE_ERROR_MESSAGES.NOT_FOUND;
        break;
      case 409:
        statusCode = 409;
        errorCode = 'CONFLICT';
        message = SAFE_ERROR_MESSAGES.CONFLICT;
        break;
      case 429:
        statusCode = 429;
        errorCode = 'RATE_LIMIT';
        message = SAFE_ERROR_MESSAGES.RATE_LIMIT;
        break;
      default:
        if (status >= 500) {
          statusCode = 500;
          errorCode = 'API_ERROR';
          message = SAFE_ERROR_MESSAGES.API_ERROR;
        }
    }
  } else if (error.code) {
    // Handle specific error codes
    switch (error.code) {
      case 'DEPTH_ZERO_SELF_SIGNED_CERT':
        statusCode = 500;
        errorCode = 'SSL_CERT_ERROR';
        message = process.env.NODE_ENV === 'development' 
          ? 'SSL certificate error - please check your local development setup'
          : 'SSL certificate verification failed';
        break;
      case 'ECONNREFUSED':
        statusCode = 500;
        errorCode = 'API_ERROR';
        message = SAFE_ERROR_MESSAGES.API_ERROR;
        break;
      case 'ETIMEDOUT':
        statusCode = 500;
        errorCode = 'API_TIMEOUT';
        message = SAFE_ERROR_MESSAGES.API_TIMEOUT;
        break;
    }
  }
  
  // Create response object
  const response = {
    success: false,
    message: message,
    error: errorCode,
  };
  
  // Add retry information for rate limiting
  if (errorCode === 'RATE_LIMIT') {
    response.retryAfter = 60; // seconds
  }
  
  // Add request ID for tracking (in production)
  if (process.env.NODE_ENV === 'production') {
    response.requestId = context.requestId || generateRequestId();
  }
  
  return { statusCode, response };
};

// Generate unique request ID
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Middleware for secure error handling
export const secureErrorHandler = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      const { statusCode, response } = createErrorResponse(error, {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        headers: {
          'user-agent': req.headers['user-agent'],
          'x-forwarded-for': req.headers['x-forwarded-for'],
        },
      });
      
      res.status(statusCode).json(response);
    }
  };
};

// Validation error handler
export const handleValidationError = (errors) => {
  return {
    success: false,
    message: 'Validation failed',
    errors: errors,
    error: 'VALIDATION_ERROR'
  };
};

// Success response helper
export const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message: message,
    data: data
  };
};

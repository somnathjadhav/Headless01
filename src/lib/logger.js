/**
 * Production-Safe Logging Utility
 * Replaces console.log statements with environment-aware logging
 */

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Debug logging - only in development
  debug(message, ...args) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // Info logging - development and staging
  info(message, ...args) {
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  // Warning logging - always log
  warn(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  // Error logging - always log, with optional external service
  error(message, error = null, context = {}) {
    const errorInfo = {
      message,
      error: error?.message || error,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorInfo);
    } else {
      // In production, log minimal info and send to external service
      console.error(`[ERROR] ${message}`);
      
      // TODO: Send to external logging service (Sentry, LogRocket, etc.)
      // this.sendToExternalService(errorInfo);
    }
  }

  // Success logging - development only
  success(message, ...args) {
    if (this.isDevelopment) {
      console.log(`[SUCCESS] ${message}`, ...args);
    }
  }

  // API logging - development only
  api(method, url, status, data = null) {
    if (this.isDevelopment) {
      console.log(`[API] ${method} ${url} - ${status}`, data);
    }
  }

  // Performance logging - development only
  performance(operation, duration, details = {}) {
    if (this.isDevelopment) {
      console.log(`[PERF] ${operation} took ${duration}ms`, details);
    }
  }

  // Send to external logging service (placeholder)
  sendToExternalService(errorInfo) {
    // Implement Sentry, LogRocket, or other logging service
    // Example:
    // Sentry.captureException(errorInfo.error, {
    //   extra: errorInfo.context,
    //   tags: { section: errorInfo.context.section }
    // });
    
    // Suppress unused parameter warning
    void errorInfo;
  }
}

// Create singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { debug, info, warn, error, success, api, performance } = logger;

export default logger;

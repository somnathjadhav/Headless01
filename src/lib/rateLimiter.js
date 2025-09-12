/**
 * Rate Limiting Utilities
 * Basic in-memory rate limiting for API endpoints
 */

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.keyGenerator - Function to generate rate limit key
 * @param {boolean} options.skipSuccessfulRequests - Skip counting successful requests
 */
export const createRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skipSuccessfulRequests = false,
    message = 'Too many requests. Please try again later.'
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create rate limit data for this key
    let rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = {
        requests: [],
        resetTime: now + windowMs
      };
      rateLimitStore.set(key, rateLimitData);
    }

    // Remove old requests outside the window
    rateLimitData.requests = rateLimitData.requests.filter(
      timestamp => timestamp > windowStart
    );

    // Check if limit exceeded
    if (rateLimitData.requests.length >= maxRequests) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        success: false,
        message: message,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: retryAfter
      });
    }

    // Add current request
    rateLimitData.requests.push(now);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - rateLimitData.requests.length);
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString());

    // Store the original send function
    const originalSend = res.send;
    
    // Override send to track successful requests
    res.send = function(data) {
      // Only count successful requests if skipSuccessfulRequests is false
      if (!skipSuccessfulRequests || res.statusCode >= 400) {
        // Request already counted above
      }
      
      // Call original send
      return originalSend.call(this, data);
    };

    if (next) next();
  };
};

// Predefined rate limiters for different use cases
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.'
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests. Please try again later.'
});

export const searchRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 20, // 20 searches per minute
  message: 'Too many search requests. Please slow down.'
});

export const reviewRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 reviews per hour
  message: 'Too many review submissions. Please try again later.'
});

// IP-based rate limiting
export const ipRateLimit = createRateLimit({
  keyGenerator: (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }
});

// User-based rate limiting (requires authentication)
export const userRateLimit = createRateLimit({
  keyGenerator: (req) => {
    // This would need to be implemented with proper user authentication
    return req.user?.id || req.ip || 'anonymous';
  }
});

// Strict rate limiting for sensitive operations
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 requests per hour
  message: 'Rate limit exceeded for sensitive operations.'
});

// Development rate limiting (more lenient)
export const devRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 1000, // Very high limit for development
  message: 'Development rate limit exceeded.'
});

// Get current rate limit status for a key
export const getRateLimitStatus = (key) => {
  const data = rateLimitStore.get(key);
  if (!data) return null;

  const now = Date.now();
  const windowStart = now - (15 * 60 * 1000); // 15 minutes
  const currentRequests = data.requests.filter(timestamp => timestamp > windowStart);

  return {
    limit: 100, // Default limit
    remaining: Math.max(0, 100 - currentRequests.length),
    reset: new Date(data.resetTime).toISOString(),
    current: currentRequests.length
  };
};

// Clear rate limit for a specific key (admin function)
export const clearRateLimit = (key) => {
  return rateLimitStore.delete(key);
};

// Get all rate limit entries (admin function)
export const getAllRateLimits = () => {
  const entries = [];
  for (const [key, data] of rateLimitStore.entries()) {
    entries.push({
      key,
      requests: data.requests.length,
      resetTime: new Date(data.resetTime).toISOString()
    });
  }
  return entries;
};

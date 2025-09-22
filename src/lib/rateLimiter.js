/**
 * Rate Limiter Utility
 * Implements client-side rate limiting to prevent API abuse
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.defaultLimit = 10; // requests per minute
    this.defaultWindow = 60000; // 1 minute in milliseconds
  }

  /**
   * Check if request is allowed based on rate limit
   * @param {string} key - Unique identifier for the rate limit
   * @param {number} limit - Maximum requests allowed (optional)
   * @param {number} window - Time window in milliseconds (optional)
   * @returns {boolean} - Whether request is allowed
   */
  isAllowed(key, limit = this.defaultLimit, window = this.defaultWindow) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < window);
    
    // Check if under limit
    if (validRequests.length < limit) {
      validRequests.push(now);
      this.requests.set(key, validRequests);
      return true;
    }
    
    return false;
  }

  /**
   * Get time until next request is allowed
   * @param {string} key - Unique identifier for the rate limit
   * @param {number} window - Time window in milliseconds (optional)
   * @returns {number} - Milliseconds until next request is allowed
   */
  getTimeUntilReset(key, window = this.defaultWindow) {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + window;
    const now = Date.now();
    
    return Math.max(0, resetTime - now);
  }

  /**
   * Clear rate limit for a specific key
   * @param {string} key - Unique identifier for the rate limit
   */
  clear(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll() {
    this.requests.clear();
  }

  /**
   * Get current request count for a key
   * @param {string} key - Unique identifier for the rate limit
   * @param {number} window - Time window in milliseconds (optional)
   * @returns {number} - Current request count
   */
  getCurrentCount(key, window = this.defaultWindow) {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    return requests.filter(timestamp => now - timestamp < window).length;
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// API rate limiting middleware for Next.js API routes
export function apiRateLimit(req, res, limit = 10, window = 60000) {
  const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  if (!rateLimiter.isAllowed(clientId, limit, window)) {
    const waitTime = rateLimiter.getTimeUntilReset(clientId, window);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
      retryAfter: Math.ceil(waitTime / 1000)
    });
    return false;
  }
  
  return true;
}

export default rateLimiter;
/**
 * Request Deduplication Utility
 * Prevents duplicate API calls by caching ongoing requests
 */

import rateLimiter from './rateLimiter.js';

class RequestDeduplication {
  constructor() {
    this.ongoingRequests = new Map();
  }

  /**
   * Deduplicate a request by URL and options
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise} - Cached promise if request is ongoing, new promise otherwise
   */
  async deduplicate(url, options = {}) {
    const key = this.createKey(url, options);
    
    // If request is already ongoing, return the existing promise
    if (this.ongoingRequests.has(key)) {
      return this.ongoingRequests.get(key);
    }

    // Create new request promise
    const requestPromise = this.makeRequest(url, options)
      .finally(() => {
        // Clean up after request completes
        this.ongoingRequests.delete(key);
      });

    // Cache the promise
    this.ongoingRequests.set(key, requestPromise);
    
    return requestPromise;
  }

  /**
   * Create a unique key for the request
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {string} - Unique key
   */
  createKey(url, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers ? JSON.stringify(options.headers) : '';
    return `${method}:${url}:${body}:${headers}`;
  }

  /**
   * Make the actual request with rate limiting
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @returns {Promise} - Request promise
   */
  async makeRequest(url, options) {
    try {
      // Extract domain for rate limiting
      const domain = new URL(url).hostname;
      
      // Check rate limit (5 requests per minute per domain)
      if (!rateLimiter.isAllowed(domain, 5, 60000)) {
        const waitTime = rateLimiter.getTimeUntilReset(domain, 60000);
        console.warn(`Rate limit exceeded for ${domain}. Waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const response = await fetch(url, {
        ...options,
        timeout: options.timeout || 10000 // Default 10s timeout
      });

      if (!response.ok) {
        // Handle rate limit responses gracefully
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 10000; // Increased to 10 seconds
          console.warn(`Server rate limit hit. Waiting ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          // Retry once after waiting
          return this.makeRequest(url, options);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  /**
   * Clear all ongoing requests
   */
  clear() {
    this.ongoingRequests.clear();
  }

  /**
   * Get the number of ongoing requests
   * @returns {number} - Number of ongoing requests
   */
  getOngoingCount() {
    return this.ongoingRequests.size;
  }
}

// Create singleton instance
const requestDeduplication = new RequestDeduplication();

export default requestDeduplication;


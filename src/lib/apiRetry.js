/**
 * API Retry Utility
 * Handles retries for API requests with exponential backoff
 */

export class ApiRetry {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  /**
   * Execute a function with retry logic
   * @param {Function} fn - Function to execute
   * @param {Object} options - Retry options
   * @returns {Promise} - Result of the function
   */
  async execute(fn, options = {}) {
    const { maxRetries = this.maxRetries, baseDelay = this.baseDelay } = options;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error)) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`🔄 API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if an error should not be retried
   * @param {Error} error - The error to check
   * @returns {boolean} - Whether the error should not be retried
   */
  shouldNotRetry(error) {
    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (error.message.includes('HTTP error! status: 4')) {
      const statusMatch = error.message.match(/status: (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        // Only retry on 429 (rate limit), not other 4xx errors
        return status !== 429;
      }
    }
    
    // Don't retry on authentication errors
    if (error.message.includes('401') || error.message.includes('403')) {
      return true;
    }

    return false;
  }

  /**
   * Sleep for a specified number of milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} - Promise that resolves after the delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make an API request with retry logic
   * @param {string} url - URL to request
   * @param {Object} options - Fetch options
   * @param {Object} retryOptions - Retry options
   * @returns {Promise<Response>} - Fetch response
   */
  async fetchWithRetry(url, options = {}, retryOptions = {}) {
    return this.execute(async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }
      
      return response;
    }, retryOptions);
  }
}

// Create singleton instance
export const apiRetry = new ApiRetry();

// Convenience function for API requests with retry
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  return apiRetry.fetchWithRetry(url, options, retryOptions);
}

export default apiRetry;

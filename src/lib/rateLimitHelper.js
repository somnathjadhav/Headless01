/**
 * Rate Limit Helper
 * Provides utilities for handling rate limiting in development
 */

/**
 * Clear rate limits (development only)
 */
export async function clearRateLimits() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Rate limit clearing is only available in development mode');
    return false;
  }

  try {
    const response = await fetch('/api/rate-limit/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Rate limits cleared successfully');
      return true;
    } else {
      console.error('❌ Failed to clear rate limits');
      return false;
    }
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error);
    return false;
  }
}

/**
 * Check if we're in development mode
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get rate limit info for debugging
 */
export function getRateLimitInfo() {
  if (!isDevelopment()) {
    return null;
  }

  return {
    isDevelopment: true,
    clearEndpoint: '/api/rate-limit/clear',
    message: 'Use clearRateLimits() to clear rate limits in development'
  };
}

/**
 * Development helper to handle rate limiting
 */
export function handleRateLimitError(error, retryCallback) {
  if (error.message.includes('Rate limit exceeded')) {
    console.warn('🚫 Rate limit exceeded. Consider:');
    console.warn('1. Wait a moment before retrying');
    console.warn('2. Use clearRateLimits() to clear limits (development only)');
    console.warn('3. Check if you\'re making too many requests');
    
    if (isDevelopment() && retryCallback) {
      console.warn('4. Retrying automatically in 5 seconds...');
      setTimeout(() => {
        retryCallback();
      }, 5000);
    }
  }
}

export default {
  clearRateLimits,
  isDevelopment,
  getRateLimitInfo,
  handleRateLimitError
};

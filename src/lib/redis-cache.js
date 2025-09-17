/**
 * Production-Ready Redis Caching System
 * Fallback to in-memory cache for development
 */

import { logger } from './logger.js';

class RedisCacheManager {
  constructor() {
    this.redis = null;
    this.memoryCache = new Map();
    this.isRedisAvailable = false;
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      // Only initialize Redis in production or when explicitly enabled
      if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
        const Redis = await import('ioredis');
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          this.isRedisAvailable = true;
          logger.info('Redis connected successfully');
        });

        this.redis.on('error', (error) => {
          this.isRedisAvailable = false;
          logger.warn('Redis connection failed, falling back to memory cache', error);
        });

        await this.redis.connect();
      } else {
        logger.info('Using in-memory cache for development');
      }
    } catch (error) {
      logger.warn('Redis initialization failed, using memory cache', error);
      this.isRedisAvailable = false;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now(),
        ttl: ttl * 1000
      });

      if (this.isRedisAvailable && this.redis) {
        await this.redis.setex(key, ttl, serializedValue);
        logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, {
          value: serializedValue,
          expires: Date.now() + (ttl * 1000)
        });
        logger.debug(`Memory Cache SET: ${key} (TTL: ${ttl}s)`);
      }
    } catch (error) {
      logger.error('Cache SET failed', error, { key, ttl });
    }
  }

  async get(key) {
    try {
      let serializedValue = null;

      if (this.isRedisAvailable && this.redis) {
        serializedValue = await this.redis.get(key);
        if (serializedValue) {
          logger.debug(`Cache HIT: ${key}`);
        } else {
          logger.debug(`Cache MISS: ${key}`);
        }
      } else {
        // Fallback to memory cache
        const item = this.memoryCache.get(key);
        if (item && Date.now() < item.expires) {
          serializedValue = item.value;
          logger.debug(`Memory Cache HIT: ${key}`);
        } else if (item) {
          this.memoryCache.delete(key);
          logger.debug(`Memory Cache EXPIRED: ${key}`);
        } else {
          logger.debug(`Memory Cache MISS: ${key}`);
        }
      }

      if (serializedValue) {
        const parsed = JSON.parse(serializedValue);
        return parsed.value;
      }

      return null;
    } catch (error) {
      logger.error('Cache GET failed', error, { key });
      return null;
    }
  }

  async del(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(key);
        logger.debug(`Cache DELETE: ${key}`);
      } else {
        this.memoryCache.delete(key);
        logger.debug(`Memory Cache DELETE: ${key}`);
      }
    } catch (error) {
      logger.error('Cache DELETE failed', error, { key });
    }
  }

  async clear() {
    try {
      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushdb();
        logger.info('Redis cache cleared');
      } else {
        this.memoryCache.clear();
        logger.info('Memory cache cleared');
      }
    } catch (error) {
      logger.error('Cache CLEAR failed', error);
    }
  }

  async exists(key) {
    try {
      if (this.isRedisAvailable && this.redis) {
        const exists = await this.redis.exists(key);
        return exists === 1;
      } else {
        const item = this.memoryCache.get(key);
        return item && Date.now() < item.expires;
      }
    } catch (error) {
      logger.error('Cache EXISTS check failed', error, { key });
      return false;
    }
  }

  // Cache with automatic key generation
  async cache(keyGenerator, dataFetcher, ttl = 300) {
    const key = typeof keyGenerator === 'function' ? keyGenerator() : keyGenerator;
    
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const freshData = await dataFetcher();
    
    // Cache the result
    await this.set(key, freshData, ttl);
    
    return freshData;
  }

  // Get cache statistics
  getStats() {
    return {
      isRedisAvailable: this.isRedisAvailable,
      memoryCacheSize: this.memoryCache.size,
      type: this.isRedisAvailable ? 'redis' : 'memory'
    };
  }
}

// Create singleton instance
export const cacheManager = new RedisCacheManager();

// Export individual methods for convenience
export const { set: cacheSet, get: cacheGet, del: cacheDel, clear: cacheClear, exists: cacheExists, cache: cacheWithFallback } = cacheManager;

export default cacheManager;

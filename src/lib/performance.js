/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

import { logger } from './logger.js';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  // Start timing an operation
  startTimer(operation) {
    if (!this.isEnabled) return null;
    
    const startTime = performance.now();
    this.metrics.set(operation, { startTime, endTime: null });
    
    return {
      end: () => this.endTimer(operation)
    };
  }

  // End timing an operation
  endTimer(operation) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(operation);
    if (!metric) return;
    
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    
    // Log performance metrics
    logger.performance(operation, Math.round(duration), {
      operation,
      duration: Math.round(duration),
      timestamp: new Date().toISOString()
    });
    
    // Store for analytics
    this.storeMetric(operation, duration);
    
    return duration;
  }

  // Measure function execution time
  async measureAsync(operation, fn) {
    const timer = this.startTimer(operation);
    try {
      const result = await fn();
      timer?.end();
      return result;
    } catch (error) {
      timer?.end();
      throw error;
    }
  }

  // Measure synchronous function execution time
  measureSync(operation, fn) {
    const timer = this.startTimer(operation);
    try {
      const result = fn();
      timer?.end();
      return result;
    } catch (error) {
      timer?.end();
      throw error;
    }
  }

  // Store metric for analytics
  storeMetric(operation, duration) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production' && process.env.ANALYTICS_ENDPOINT) {
      this.sendToAnalytics(operation, duration);
    }
  }

  // Send metrics to analytics service
  async sendToAnalytics(operation, duration) {
    try {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance',
          operation,
          duration,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : 'server'
        })
      });
    } catch (error) {
      logger.warn('Failed to send performance metrics to analytics', error);
    }
  }

  // Get performance summary
  getSummary() {
    const summary = {};
    for (const [operation, metric] of this.metrics.entries()) {
      if (metric.duration) {
        summary[operation] = {
          duration: Math.round(metric.duration),
          timestamp: new Date(metric.startTime).toISOString()
        };
      }
    }
    return summary;
  }

  // Clear metrics
  clear() {
    this.metrics.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Higher-order function for automatic performance monitoring
export const withPerformanceMonitoring = (operation, fn) => {
  return async (...args) => {
    return performanceMonitor.measureAsync(operation, () => fn(...args));
  };
};

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const measure = (operation, fn) => {
    return performanceMonitor.measureAsync(operation, fn);
  };

  const measureSync = (operation, fn) => {
    return performanceMonitor.measureSync(operation, fn);
  };

  const startTimer = (operation) => {
    return performanceMonitor.startTimer(operation);
  };

  return { measure, measureSync, startTimer };
};

// Web Vitals monitoring
export const initWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  const vitals = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];
  
  vitals.forEach(metric => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      const getMetric = {
        CLS: getCLS,
        FID: getFID,
        FCP: getFCP,
        LCP: getLCP,
        TTFB: getTTFB
      }[metric];

      if (getMetric) {
        getMetric((metricData) => {
          logger.performance(`Web Vital: ${metric}`, metricData.value, {
            metric: metricData.name,
            value: metricData.value,
            rating: metricData.rating,
            delta: metricData.delta
          });
        });
      }
    });
  });
};

export default performanceMonitor;

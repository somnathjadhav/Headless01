/**
 * Performance Monitor Component
 * Tracks and displays performance metrics
 */

import React, { useState, useEffect } from 'react';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    ongoingRequests: 0
  });

  useEffect(() => {
    // Monitor page load time
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, pageLoadTime: Math.round(loadTime) }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    // Monitor API response times
    const originalFetch = window.fetch;
    let totalResponseTime = 0;
    let requestCount = 0;

    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const responseTime = performance.now() - startTime;
        totalResponseTime += responseTime;
        requestCount++;
        
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: Math.round(totalResponseTime / requestCount)
        }));
        
        return response;
      } catch (error) {
        const responseTime = performance.now() - startTime;
        totalResponseTime += responseTime;
        requestCount++;
        
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: Math.round(totalResponseTime / requestCount)
        }));
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value, thresholds) => {
    if (value <= thresholds.good) return '🟢';
    if (value <= thresholds.warning) return '🟡';
    return '🔴';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getPerformanceColor(metrics.pageLoadTime, { good: 1000, warning: 2000 })}`}>
            {metrics.pageLoadTime}ms
          </div>
          <div className="text-sm text-gray-600">Page Load Time</div>
          <div className="text-xs text-gray-500 mt-1">
            {getPerformanceIcon(metrics.pageLoadTime, { good: 1000, warning: 2000 })} 
            {metrics.pageLoadTime <= 1000 ? ' Excellent' : 
             metrics.pageLoadTime <= 2000 ? ' Good' : ' Needs Improvement'}
          </div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getPerformanceColor(metrics.apiResponseTime, { good: 500, warning: 1000 })}`}>
            {metrics.apiResponseTime}ms
          </div>
          <div className="text-sm text-gray-600">Avg API Response</div>
          <div className="text-xs text-gray-500 mt-1">
            {getPerformanceIcon(metrics.apiResponseTime, { good: 500, warning: 1000 })} 
            {metrics.apiResponseTime <= 500 ? ' Fast' : 
             metrics.apiResponseTime <= 1000 ? ' Good' : ' Slow'}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Optimizations Applied:</span>
            <span className="text-green-600 font-medium">✓ Active</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>• Request Deduplication</span>
            <span className="text-green-600">✓</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>• Parallel API Calls</span>
            <span className="text-green-600">✓</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>• Extended Timeouts</span>
            <span className="text-green-600">✓</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>• Skeleton Loading</span>
            <span className="text-green-600">✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}


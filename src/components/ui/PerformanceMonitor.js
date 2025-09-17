import { useEffect, useState } from 'react';

/**
 * Performance monitoring component for development
 * Helps track page load times and API response times
 */
export default function PerformanceMonitor({ pageName = 'Unknown' }) {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    apiCalls: 0,
    renderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Track page load time
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: Math.round(loadTime)
      }));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${pageName} page loaded in ${Math.round(loadTime)}ms`);
      }
    };

    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const apiStartTime = performance.now();
      setMetrics(prev => ({ ...prev, apiCalls: prev.apiCalls + 1 }));
      
      try {
        const response = await originalFetch(...args);
        const apiTime = performance.now() - apiStartTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📡 API call to ${args[0]} took ${Math.round(apiTime)}ms`);
        }
        
        return response;
      } catch (error) {
        const apiTime = performance.now() - apiStartTime;
        console.error(`❌ API call to ${args[0]} failed after ${Math.round(apiTime)}ms:`, error);
        throw error;
      }
    };

    // Track render time
    const renderStartTime = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStartTime;
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderTime)
      }));
    });

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
      window.fetch = originalFetch;
    };
  }, [pageName]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div className="font-bold">{pageName} Performance</div>
      <div>Load: {metrics.pageLoadTime}ms</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>API Calls: {metrics.apiCalls}</div>
    </div>
  );
}

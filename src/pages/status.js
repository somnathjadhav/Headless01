import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/layout/SEO';
import PerformanceMonitor from '../components/PerformanceMonitor';

export default function SimpleSystemStatus() {
  const router = useRouter();
  const [systemStatus, setSystemStatus] = useState({
    wordpress: { status: 'checking', message: 'Checking...', details: {} },
    woocommerce: { status: 'checking', message: 'Checking...', details: {} },
    frontend: { status: 'online', message: 'Online', details: {} },
    lastChecked: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check system status immediately
    checkSystemStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemStatus = async () => {
    setIsLoading(true);
    
    try {
      // Use combined status endpoint for better performance
      const response = await fetch('/api/status/combined');
      const data = await response.json();
      
      if (data.success && data.data) {
        setSystemStatus({
          wordpress: data.data.wordpress,
          woocommerce: data.data.woocommerce,
          frontend: { status: 'online', message: 'Online', details: {} },
          lastChecked: new Date().toLocaleTimeString()
        });
      } else {
        // Fallback to individual checks if combined fails
        const [wpResponse, wcResponse] = await Promise.allSettled([
          fetch('/api/status/wordpress'),
          fetch('/api/status/woocommerce')
        ]);
        
        const wpData = wpResponse.status === 'fulfilled' ? await wpResponse.value.json() : { success: false };
        const wcData = wcResponse.status === 'fulfilled' ? await wcResponse.value.json() : { success: false };
        
        setSystemStatus({
          wordpress: wpData,
          woocommerce: wcData,
          frontend: { status: 'online', message: 'Online', details: {} },
          lastChecked: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'installed':
        return 'text-green-600 bg-green-100';
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-orange-600 bg-orange-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'installed':
        return '🟡';
      case 'checking':
        return '🔄';
      case 'error':
        return '🟠';
      case 'offline':
        return '🔴';
      default:
        return '⚪';
    }
  };

  // Ensure systemStatus is always defined and has the expected structure
  const safeSystemStatus = systemStatus || {
    wordpress: { status: 'checking', message: 'Checking...', details: {} },
    woocommerce: { status: 'checking', message: 'Checking...', details: {} },
    frontend: { status: 'online', message: 'Online', details: {} },
    lastChecked: null
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO title="System Status" description="Real-time system status for Eternitty Headless WordPress" />
      
      <div className="flex">
        {/* Side Panel */}
        <div className="w-64 bg-gray-900 shadow-xl min-h-screen">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            </div>
            
            <nav className="space-y-2">
              <a
                href="/status"
                className="flex items-center px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Status
              </a>
              
              <a
                href="/smtp-test"
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                SMTP Test
              </a>
              
              <a
                href="/typography"
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Typography
              </a>
              
              {/* Placeholder for future links */}
              <div className="pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 px-4 mb-2">Coming Soon</p>
                <div className="space-y-1">
                  <div className="flex items-center px-4 py-2 text-gray-500 rounded-xl">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Analytics
                  </div>
                  <div className="flex items-center px-4 py-2 text-gray-500 rounded-xl">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  System Status
                </h1>
                <p className="text-xl text-gray-600">
                  Real-time monitoring of your headless WordPress infrastructure
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={checkSystemStatus}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? 'Checking...' : 'Refresh Status'}
                </button>
              </div>
            </div>
            {safeSystemStatus.lastChecked && (
              <div className="mt-4 text-right">
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                  Last checked: {safeSystemStatus.lastChecked}
                </span>
              </div>
            )}
          </div>

          {/* Status Grid - 2 cards per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* WordPress Backend Status */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    WordPress Backend
                  </h3>
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(safeSystemStatus.wordpress?.status)}`}>
                  {getStatusIcon(safeSystemStatus.wordpress?.status)} {safeSystemStatus.wordpress?.message || 'Checking...'}
                </span>
              </div>
              
              <div className="space-y-4">
                {safeSystemStatus.wordpress?.details?.name && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Site Name</span>
                      <span className="font-semibold text-gray-900">{safeSystemStatus.wordpress.details.name}</span>
                    </div>
                  </div>
                )}
                {safeSystemStatus.wordpress?.details?.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Description</span>
                      <span className="font-medium text-sm text-gray-700 text-right max-w-[200px]">{safeSystemStatus.wordpress.details.description}</span>
                    </div>
                  </div>
                )}
                {safeSystemStatus.wordpress?.details?.endpoints && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">API Status</span>
                      <span className="font-semibold text-green-800 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Available
                      </span>
                    </div>
                  </div>
                )}
                {safeSystemStatus.wordpress?.details?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">Error: {safeSystemStatus.wordpress.details.error}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Security</span>
                  <span className="font-semibold text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Protected
                  </span>
                </div>
              </div>
            </div>

            {/* WooCommerce Status */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    WooCommerce
                  </h3>
                </div>
              </div>
              
              <div className="mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(safeSystemStatus.woocommerce?.status)}`}>
                  {getStatusIcon(safeSystemStatus.woocommerce?.status)} {safeSystemStatus.woocommerce?.message || 'Checking...'}
                </span>
              </div>
              
              <div className="space-y-4">
                {safeSystemStatus.woocommerce?.details?.status && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-700">Status</span>
                      <span className="font-semibold text-yellow-800">{safeSystemStatus.woocommerce.details.status}</span>
                    </div>
                  </div>
                )}
                {safeSystemStatus.woocommerce?.details?.message && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-blue-700">{safeSystemStatus.woocommerce.details.message}</span>
                    </div>
                  </div>
                )}
                {safeSystemStatus.woocommerce?.details?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">Error: {safeSystemStatus.woocommerce.details.error}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">API Version</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">v3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Endpoint</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">/wp-json/wc/v3/</span>
                </div>
              </div>
            </div>

          </div>

          {/* System Overview */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Object.values(safeSystemStatus).filter(s => s && s.status && (s.status === 'online' || s.status === 'installed')).length}
                  </div>
                  <div className="text-gray-600">Services Online</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {safeSystemStatus.wordpress?.status === 'online' ? 'Connected' : 'Disconnected'}
                  </div>
                  <div className="text-gray-600">Backend Connection</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {safeSystemStatus.woocommerce?.status === 'installed' || safeSystemStatus.woocommerce?.status === 'online' ? 'Ready' : 'Not Ready'}
                  </div>
                  <div className="text-gray-600">E-commerce Status</div>
                </div>
              </div>
            </div>
            
            <PerformanceMonitor />
          </div>
        </div>
      </div>
    </div>
  );
}
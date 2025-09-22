import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import SEO from '../components/layout/SEO';
import PerformanceMonitor from '../components/PerformanceMonitor';

export default function FrontendAdmin() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    wordpress: { status: 'checking', message: 'Checking...', details: {} },
    woocommerce: { status: 'checking', message: 'Checking...', details: {} },
    frontend: { status: 'online', message: 'Online', details: {} },
    lastChecked: null
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Apply global typography
  useGlobalTypography();

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionToken = localStorage.getItem('adminSession');
      if (!sessionToken) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/status', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setAdminUser(data.data.user);
        // Load system status after authentication
        checkSystemStatus();
      } else {
        localStorage.removeItem('adminSession');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminSession');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminSession', data.data.sessionToken);
        setIsAuthenticated(true);
        setAdminUser(data.data.user);
        setLoginForm({ username: '', password: '' });
        // Load system status after successful login
        checkSystemStatus();
      } else {
        setLoginError(data.message || 'Authentication failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
    setAdminUser(null);
    setSystemStatus({
      wordpress: { status: 'checking', message: 'Checking...', details: {} },
      woocommerce: { status: 'checking', message: 'Checking...', details: {} },
      frontend: { status: 'online', message: 'Online', details: {} },
      lastChecked: null
    });
  };

  const checkSystemStatus = async () => {
    setStatusLoading(true);
    
    try {
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
      setStatusLoading(false);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Admin dashboard with modal login
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO title="Admin Dashboard" description="WordPress Admin Dashboard" />
      
      {/* Login Modal */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Enter your WordPress admin credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm">{loginError}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Only WordPress administrators can access this panel
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      
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

            {/* User Info */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {adminUser?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{adminUser?.name}</p>
                  <p className="text-gray-400 text-xs">Administrator</p>
                </div>
              </div>
            </div>
            
            <nav className="space-y-2">
              <a
                href="#"
                className="flex items-center px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Status
              </a>
              
              <a
                href="/status"
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Public Status
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
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-xl transition-colors duration-200 mt-6"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
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
                  Admin Dashboard
                </h1>
                <p className="text-xl text-gray-600">
                  System monitoring and management for Eternitty Headless WordPress
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={checkSystemStatus}
                  disabled={statusLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {statusLoading ? 'Checking...' : 'Refresh Status'}
                </button>
              </div>
            </div>
            {systemStatus.lastChecked && (
              <div className="mt-4 text-right">
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                  Last checked: {systemStatus.lastChecked}
                </span>
              </div>
            )}
          </div>

          {/* Status Grid */}
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
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(systemStatus.wordpress?.status)}`}>
                  {getStatusIcon(systemStatus.wordpress?.status)} {systemStatus.wordpress?.message || 'Checking...'}
                </span>
              </div>
              
              <div className="space-y-4">
                {systemStatus.wordpress?.details?.name && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Site Name</span>
                      <span className="font-semibold text-gray-900">{systemStatus.wordpress.details.name}</span>
                    </div>
                  </div>
                )}
                {systemStatus.wordpress?.details?.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Description</span>
                      <span className="font-medium text-sm text-gray-700 text-right max-w-[200px]">{systemStatus.wordpress.details.description}</span>
                    </div>
                  </div>
                )}
                {systemStatus.wordpress?.details?.endpoints && (
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
                {systemStatus.wordpress?.details?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">Error: {systemStatus.wordpress.details.error}</span>
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
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(systemStatus.woocommerce?.status)}`}>
                  {getStatusIcon(systemStatus.woocommerce?.status)} {systemStatus.woocommerce?.message || 'Checking...'}
                </span>
              </div>
              
              <div className="space-y-4">
                {systemStatus.woocommerce?.details?.status && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-700">Status</span>
                      <span className="font-semibold text-yellow-800">{systemStatus.woocommerce.details.status}</span>
                    </div>
                  </div>
                )}
                {systemStatus.woocommerce?.details?.message && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-blue-700">{systemStatus.woocommerce.details.message}</span>
                    </div>
                  </div>
                )}
                {systemStatus.woocommerce?.details?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 font-medium">Error: {systemStatus.woocommerce.details.error}</span>
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
                    {Object.values(systemStatus).filter(s => s && s.status && (s.status === 'online' || s.status === 'installed')).length}
                  </div>
                  <div className="text-gray-600">Services Online</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {systemStatus.wordpress?.status === 'online' ? 'Connected' : 'Disconnected'}
                  </div>
                  <div className="text-gray-600">Backend Connection</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {systemStatus.woocommerce?.status === 'installed' || systemStatus.woocommerce?.status === 'online' ? 'Ready' : 'Not Ready'}
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

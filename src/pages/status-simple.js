import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/layout/SEO';
import { useAuth } from '../context/AuthContext';

export default function SimpleSystemStatus() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [systemStatus, setSystemStatus] = useState({
    wordpress: { status: 'checking', message: 'Checking...', details: {} },
    woocommerce: { status: 'checking', message: 'Checking...', details: {} },
    frontend: { status: 'online', message: 'Online', details: {} },
    lastChecked: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      checkSystemStatus();
    }
  }, [isAuthenticated, user]);

  const checkSystemStatus = async () => {
    setIsLoading(true);
    try {
      // Check WordPress
      const wpResponse = await fetch('/api/status/wordpress');
      const wpData = await wpResponse.json();
      
      // Check WooCommerce
      const wcResponse = await fetch('/api/status/woocommerce');
      const wcData = await wcResponse.json();

      setSystemStatus({
        wordpress: wpData.success ? { 
          status: 'online', 
          message: 'Connected',
          details: wpData.data || {}
        } : { 
          status: 'offline', 
          message: 'Disconnected',
          details: { error: wpData.message }
        },
        woocommerce: wcData.success ? { 
          status: 'installed', 
          message: 'Ready',
          details: wcData.data || {}
        } : { 
          status: 'error', 
          message: 'Needs Setup',
          details: { error: wcData.message, requires: wcData.data?.requires }
        },
        frontend: { 
          status: 'online', 
          message: 'Healthy',
          details: { 
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            framework: 'Next.js 14',
            environment: 'Production'
          }
        },
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Status check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result.success) {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'installed':
        return 'bg-green-100 text-green-800';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'installed':
        return '✓';
      case 'checking':
        return '⏳';
      case 'offline':
      case 'error':
        return '✗';
      default:
        return '?';
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
            <p className="text-gray-600 mt-2">Sign in to view system status</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm">{loginError}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="System Status" description="Simple system status overview" />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            
            <nav className="space-y-2">
              <a
                href="/status-simple"
                className="flex items-center px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Status
              </a>
              
              <a
                href="/smtp-test"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                SMTP Test
              </a>
              
              <a
                href="/typography"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Typography
              </a>
              
              <a
                href="/account"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </a>
              
              {/* Placeholder for future links */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 px-4 mb-2">Coming Soon</p>
                <div className="space-y-1">
                  <div className="flex items-center px-4 py-2 text-gray-400 rounded-xl">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Analytics
                  </div>
                  <div className="flex items-center px-4 py-2 text-gray-400 rounded-xl">
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
            <p className="text-gray-600 mt-1">Quick overview of your system health</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/status')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Detailed View
            </button>
            <button
              onClick={checkSystemStatus}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Refresh'}
            </button>
            <button
              onClick={logout}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Last Checked */}
        {systemStatus.lastChecked && (
          <div className="mb-6 text-right">
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
              Last checked: {systemStatus.lastChecked}
            </span>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WordPress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">WordPress</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.wordpress.status)}`}>
                {getStatusIcon(systemStatus.wordpress.status)} {systemStatus.wordpress.message}
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">Backend API connection</p>
              
              {systemStatus.wordpress.details.url && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">URL</span>
                    <span className="text-sm text-gray-900 font-mono">{systemStatus.wordpress.details.url}</span>
                  </div>
                </div>
              )}
              
              {systemStatus.wordpress.details.status && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">API Status</span>
                    <span className="text-sm font-semibold text-green-800 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Available
                    </span>
                  </div>
                </div>
              )}
              
              {systemStatus.wordpress.details.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{systemStatus.wordpress.details.error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WooCommerce */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">WooCommerce</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.woocommerce.status)}`}>
                {getStatusIcon(systemStatus.woocommerce.status)} {systemStatus.woocommerce.message}
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">E-commerce functionality</p>
              
              {systemStatus.woocommerce.details.apiVersion && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">API Version</span>
                    <span className="text-sm text-gray-900 font-mono">{systemStatus.woocommerce.details.apiVersion}</span>
                  </div>
                </div>
              )}
              
              {systemStatus.woocommerce.details.status === 'installed' && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">Status</span>
                    <span className="text-sm font-semibold text-green-800 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Ready
                    </span>
                  </div>
                </div>
              )}
              
              {systemStatus.woocommerce.details.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{systemStatus.woocommerce.details.error}</span>
                  </div>
                </div>
              )}
              
              {systemStatus.woocommerce.details.requires && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-700 text-sm font-medium">Requires: {systemStatus.woocommerce.details.requires.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Frontend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Frontend</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.frontend.status)}`}>
                {getStatusIcon(systemStatus.frontend.status)} {systemStatus.frontend.message}
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">Next.js application</p>
              
              {systemStatus.frontend.details.url && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">URL</span>
                    <span className="text-sm text-gray-900 font-mono">{systemStatus.frontend.details.url}</span>
                  </div>
                </div>
              )}
              
              {systemStatus.frontend.details.framework && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Framework</span>
                    <span className="text-sm text-gray-900">{systemStatus.frontend.details.framework}</span>
                  </div>
                </div>
              )}
              
              {systemStatus.frontend.details.environment && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700">Environment</span>
                    <span className="text-sm font-semibold text-green-800">{systemStatus.frontend.details.environment}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/smtp-test"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">SMTP Test</h4>
                <p className="text-sm text-gray-600">Test email configuration</p>
              </div>
            </a>

            <a
              href="/typography"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Typography</h4>
                <p className="text-sm text-gray-600">Font and text styling</p>
              </div>
            </a>

            <a
              href="/account"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Account</h4>
                <p className="text-sm text-gray-600">User profile and settings</p>
              </div>
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

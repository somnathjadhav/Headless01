import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/layout/SEO';
import { useAuth } from '../context/AuthContext';

export default function SimpleSystemStatus() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [systemStatus, setSystemStatus] = useState({
    wordpress: { status: 'checking', message: 'Checking...' },
    woocommerce: { status: 'checking', message: 'Checking...' },
    frontend: { status: 'online', message: 'Online' },
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
        wordpress: wpData.success ? { status: 'online', message: 'Connected' } : { status: 'offline', message: 'Disconnected' },
        woocommerce: wcData.success ? { status: 'installed', message: 'Ready' } : { status: 'error', message: 'Needs Setup' },
        frontend: { status: 'online', message: 'Healthy' },
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">WordPress</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.wordpress.status)}`}>
                {getStatusIcon(systemStatus.wordpress.status)} {systemStatus.wordpress.message}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Backend API connection</p>
          </div>

          {/* WooCommerce */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">WooCommerce</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.woocommerce.status)}`}>
                {getStatusIcon(systemStatus.woocommerce.status)} {systemStatus.woocommerce.message}
              </span>
            </div>
            <p className="text-gray-600 text-sm">E-commerce functionality</p>
          </div>

          {/* Frontend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Frontend</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.frontend.status)}`}>
                {getStatusIcon(systemStatus.frontend.status)} {systemStatus.frontend.message}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Next.js application</p>
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
  );
}

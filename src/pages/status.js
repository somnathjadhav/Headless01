import React, { useState, useEffect } from 'react';
import SEO from '../components/layout/SEO';
import { useAuth } from '../context/AuthContext';
import GeometricDesign from '../components/ui/GeometricDesign';
import SimpleCaptcha from '../components/ui/SimpleCaptcha';
import GoogleReCaptcha from '../components/ui/GoogleReCaptcha';
import { useRecaptchaConfig } from '../hooks/useRecaptchaConfig';

export default function SystemStatus() {
  const { user, isAuthenticated: authIsAuthenticated, login, logout: authLogout } = useAuth();
  const { isEnabled: isRecaptchaEnabled, isLoading: isRecaptchaLoading } = useRecaptchaConfig();
  const [systemStatus, setSystemStatus] = useState({
    wordpress: { status: 'checking', message: 'Checking...', details: {} },
    woocommerce: { status: 'checking', message: 'Checking...', details: {} },
    frontend: { status: 'online', message: 'Online', details: {} },
    lastChecked: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Only start checking status if authenticated
    if (authIsAuthenticated && user) {
      checkSystemStatus();
      // Check status every 30 seconds
      const interval = setInterval(checkSystemStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [authIsAuthenticated, user]);

  // Check if user has admin privileges
  const isAdminUser = (user) => {
    if (!user || !user.roles) return false;
    return user.roles.includes('administrator') || user.roles.includes('admin');
  };

  // Verify reCAPTCHA token
  const verifyRecaptcha = async (token) => {
    try {
      const response = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCaptchaVerified(true);
        setRecaptchaToken(token);
        return true;
      } else {
        setCaptchaVerified(false);
        setRecaptchaToken(null);
        return false;
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      setCaptchaVerified(false);
      setRecaptchaToken(null);
      return false;
    }
  };

  const handleRecaptchaExpire = () => {
    setCaptchaVerified(false);
    setRecaptchaToken(null);
  };

  const handleRecaptchaError = (error) => {
    console.error('reCAPTCHA error:', error);
    setCaptchaVerified(false);
    setRecaptchaToken(null);
  };

  const checkSystemStatus = async () => {
    setIsLoading(true);
    
    try {
      // Check WordPress Backend
      const wpStatus = await checkWordPressStatus();
      
      // Check WooCommerce
      const wcStatus = await checkWooCommerceStatus();
      
      // Check Frontend
      const frontendStatus = await checkFrontendStatus();
      
      setSystemStatus({
        wordpress: wpStatus,
        woocommerce: wcStatus,
        frontend: frontendStatus,
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWordPressStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/`);
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'online',
          message: 'Online',
          details: {
            name: data.name || 'Unknown',
            description: data.description || 'No description',
            version: data.version || 'Unknown',
            endpoints: Object.keys(data.routes || {}).length
          }
        };
      } else {
        return {
          status: 'error',
          message: `HTTP ${response.status}`,
          details: { error: response.statusText }
        };
      }
    } catch (error) {
      return {
        status: 'offline',
        message: 'Offline',
        details: { error: error.message }
      };
    }
  };

  const checkWooCommerceStatus = async () => {
    try {
      // Check WooCommerce REST API
      const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products`);
      
      if (wcResponse.status === 401) {
        // WooCommerce is installed but needs authentication
        return {
          status: 'installed',
          message: 'Installed (Needs API Keys)',
          details: {
            status: 'Requires authentication',
            message: 'WooCommerce is installed and working, but needs API keys for full access'
          }
        };
      } else if (wcResponse.ok) {
        return {
          status: 'online',
          message: 'Online',
          details: {
            status: 'Fully accessible',
            message: 'WooCommerce API is accessible without authentication'
          }
        };
      } else {
        return {
          status: 'error',
          message: `HTTP ${wcResponse.status}`,
          details: { error: wcResponse.statusText }
        };
      }
    } catch (error) {
      return {
        status: 'offline',
        message: 'Offline',
        details: { error: error.message }
      };
    }
  };

  const checkFrontendStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        return {
          status: 'online',
          message: 'Online',
          details: {
            status: 'Healthy',
            message: 'Next.js frontend is running normally'
          }
        };
      } else {
        return {
          status: 'error',
          message: `HTTP ${response.status}`,
          details: { error: response.statusText }
        };
      }
    } catch (error) {
      return {
        status: 'online',
        message: 'Online',
        details: {
          status: 'Running',
          message: 'Next.js frontend is accessible'
        }
      };
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



  // WordPress admin authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    // Check reCAPTCHA only if it's enabled
    if (isRecaptchaEnabled && (!captchaVerified || !recaptchaToken)) {
      setFormErrors({ captcha: 'Please complete the reCAPTCHA verification' });
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const result = await login(loginForm.email, loginForm.password, recaptchaToken);
      
      if (result.success) {
        // For now, let's allow access to any authenticated user
        // TODO: Implement proper role checking once we get roles from WordPress
        checkSystemStatus();
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };


  // Show login form if not authenticated
  if (!authIsAuthenticated || !user) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Branding */}
            <div className="text-left mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                System Status Access
              </h1>
              <p className="text-gray-600">
                Sign in to access system monitoring and status information.
              </p>
            </div>

            {/* Error Alert */}
            {loginError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Username *
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm border-gray-300"
                  placeholder="Enter your email or username"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm border-gray-300"
                  placeholder="Enter password"
                />
              </div>

              {/* reCAPTCHA */}
              <div>
                {isRecaptchaLoading ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Security Check *
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Loading security check...</span>
                        </div>
                        <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-500">Loading...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isRecaptchaEnabled ? (
                  <GoogleReCaptcha 
                    onVerify={verifyRecaptcha}
                    onExpire={handleRecaptchaExpire}
                    onError={handleRecaptchaError}
                    error={formErrors.captcha}
                  />
                ) : (
                  <SimpleCaptcha 
                    onVerify={verifyRecaptcha}
                    error={formErrors.captcha}
                  />
                )}
                {formErrors.captcha && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.captcha}</p>
                )}
              </div>

              {/* Log In Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Access System Status'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This page contains sensitive system information and is restricted to administrators only.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Geometric Design */}
        <div className="hidden lg:flex lg:flex-1">
          <GeometricDesign />
        </div>
      </div>
    );
  }

  // Show loading state while checking status
  if (isLoading && !systemStatus.lastChecked) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">System Status</h1>
            <p className="text-xl text-gray-600">Checking system status...</p>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SEO title="System Status" description="Real-time system status for Eternitty Headless WordPress" />
      
      <div className="flex">
        {/* Side Panel */}
        <div className="w-64 bg-white shadow-xl min-h-screen">
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
                <button
                  onClick={() => {
                    authLogout();
                  }}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Logout
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

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
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

            {/* Frontend Status */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Next.js Frontend
                  </h3>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(safeSystemStatus.frontend?.status)}`}>
                  {getStatusIcon(safeSystemStatus.frontend?.status)} {safeSystemStatus.frontend?.message || 'Checking...'}
                </span>
              </div>
              
              <div className="space-y-4">
                {safeSystemStatus.frontend?.details?.status && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">Status</span>
                      <span className="font-semibold text-green-800 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {safeSystemStatus.frontend.details.status}
                      </span>
                    </div>
                  </div>
                )}
                {safeSystemStatus.frontend?.details?.message && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-blue-700">{safeSystemStatus.frontend.details.message}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">URL</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">http://localhost:3000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Framework</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">Next.js 14</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Environment</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Development</span>
                </div>
              </div>
            </div>

          </div>

          {/* System Overview */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
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
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { clearRateLimits, isDevelopment } from '../lib/rateLimitHelper';

export default function FrontendAdmin() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState({
    wordpress: 'checking',
    woocommerce: 'checking',
    smtp: 'checking',
    frontend: 'checking'
  });
  const [loading, setLoading] = useState(true);
  const [smtpConfig, setSmtpConfig] = useState(null);
  const [typographySettings, setTypographySettings] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=/frontend-admin');
      return;
    }
    
    // Check if user has admin privileges
    if (user && !user.isAdmin && user.email !== 'admin@eternitty.com' && user.email !== 'somnathhjadhav@gmail.com' && user.username !== 'headless') {
      showError('Access denied. Admin privileges required.');
      router.push('/');
        return;
      }

    loadSystemStatus();
    loadSMTPConfig();
    loadTypographySettings();
  }, [isAuthenticated, user, router]);

  const loadSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Check WordPress connection
      const wpResponse = await fetch('/api/site-info');
      const wpData = await wpResponse.json();
      
      // Check WooCommerce connection (with error handling)
      let wcData = { success: false, message: 'Not available' };
      try {
        const wcResponse = await fetch('/api/woocommerce/status');
        wcData = await wcResponse.json();
      } catch (wcError) {
        console.log('WooCommerce status check failed:', wcError);
      }
      
      // Check SMTP configuration (with error handling)
      let smtpData = { success: false, message: 'Not available' };
      try {
        const smtpResponse = await fetch('/api/smtp/status');
        smtpData = await smtpResponse.json();
      } catch (smtpError) {
        console.log('SMTP status check failed:', smtpError);
      }
      
      setSystemStatus({
        wordpress: wpData.success ? 'connected' : 'error',
        woocommerce: wcData.success ? 'connected' : 'error',
        smtp: smtpData.success ? 'configured' : 'not-configured',
        frontend: 'running'
      });
      
    } catch (error) {
      console.error('Error loading system status:', error);
      showError('Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  const loadSMTPConfig = async () => {
    try {
      const response = await fetch('/api/smtp/config');
      const data = await response.json();
      if (data.success) {
        setSmtpConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading SMTP config:', error);
      // Don't show error for missing SMTP config
    }
  };

  const loadTypographySettings = async () => {
    try {
      const response = await fetch('/api/theme-options');
      const data = await response.json();
      if (data.success) {
        setTypographySettings(data.options);
      }
    } catch (error) {
      console.error('Error loading typography settings:', error);
    }
  };

  const testSMTPConnection = async () => {
    try {
      const response = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: user?.email || 'test@example.com'
        })
      });

      const data = await response.json();
      if (data.success) {
        showSuccess('SMTP test email sent successfully!');
      } else {
        showError(data.message || 'SMTP test failed');
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      showError('Failed to test SMTP connection');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'running':
        return '✅';
      case 'error':
      case 'not-configured':
        return '❌';
      case 'checking':
        return '⏳';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'running':
        return 'text-green-600';
      case 'error':
      case 'not-configured':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Dashboard</h3>
            <p className="text-gray-600 text-sm">Preparing your workspace...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Frontend Admin Dashboard - Headless WooCommerce</title>
        <meta name="description" content="Admin dashboard for managing frontend settings and system status" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Frontend Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your headless WooCommerce frontend settings and monitor system status</p>
            </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'System Overview', icon: '📊' },
                { id: 'smtp', label: 'SMTP Settings', icon: '📧' },
                { id: 'typography', label: 'Typography', icon: '🎨' },
                { id: 'email-templates', label: 'Email Templates', icon: '📝' },
                { id: 'rate-limiting', label: 'Rate Limiting', icon: '⏱️' },
                { id: 'security', label: 'Security', icon: '🔒' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
              </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === 'overview' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { key: 'wordpress', label: 'WordPress Backend', description: 'Connection to WordPress' },
                    { key: 'woocommerce', label: 'WooCommerce API', description: 'WooCommerce integration' },
                    { key: 'smtp', label: 'SMTP Email', description: 'Email configuration' },
                    { key: 'frontend', label: 'Frontend App', description: 'Next.js application' }
                  ].map((service) => (
                    <div key={service.key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{service.label}</h3>
                        <span className={`text-lg ${getStatusColor(systemStatus[service.key])}`}>
                          {getStatusIcon(systemStatus[service.key])}
                        </span>
              </div>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className={`text-sm mt-2 capitalize ${getStatusColor(systemStatus[service.key])}`}>
                        Status: {systemStatus[service.key].replace('-', ' ')}
                      </p>
                  </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={loadSystemStatus}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔄 Refresh Status
                    </button>
              <button
                      onClick={testSMTPConnection}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                      📧 Test SMTP
              </button>
                    <a
                      href="/api/health"
                      target="_blank"
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      🏥 Health Check
                    </a>
            </div>
          </div>
        </div>
      )}

            {activeTab === 'smtp' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">SMTP Email Configuration</h2>
                
                {smtpConfig ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Current Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                          <p className="mt-1 text-sm text-gray-900">{smtpConfig.host || 'Not configured'}</p>
              </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                          <p className="mt-1 text-sm text-gray-900">{smtpConfig.port || 'Not configured'}</p>
            </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Security</label>
                          <p className="mt-1 text-sm text-gray-900">{smtpConfig.secure || 'Not configured'}</p>
                </div>
                <div>
                          <label className="block text-sm font-medium text-gray-700">From Email</label>
                          <p className="mt-1 text-sm text-gray-900">{smtpConfig.from_email || 'Not configured'}</p>
                </div>
              </div>
            </div>
            
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-900 mb-2">⚠️ Configuration Required</h3>
                      <p className="text-sm text-yellow-800 mb-4">
                        SMTP settings are managed through your WordPress backend. To configure email settings:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
                        <li>Go to your WordPress admin panel</li>
                        <li>Navigate to the Headless Pro plugin settings</li>
                        <li>Configure SMTP settings in the Email section</li>
                        <li>Test the configuration using the button below</li>
                      </ol>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={testSMTPConnection}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📧 Send Test Email
                      </button>
              <button
                        onClick={loadSMTPConfig}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                        🔄 Refresh Config
              </button>
          </div>
        </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📧</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">SMTP Not Configured</h3>
                    <p className="text-gray-600 mb-4">Email functionality is not available without SMTP configuration.</p>
                <button
                      onClick={loadSMTPConfig}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                      🔄 Check Configuration
                </button>
              </div>
                )}
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Typography Settings</h2>
                
                {typographySettings ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Current Typography Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Primary Font</label>
                          <p className="mt-1 text-sm text-gray-900 font-medium" style={{ fontFamily: typographySettings.primaryFont }}>
                            {typographySettings.primaryFont || 'Inter (Default)'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Secondary Font</label>
                          <p className="mt-1 text-sm text-gray-900 font-medium" style={{ fontFamily: typographySettings.secondaryFont }}>
                            {typographySettings.secondaryFont || 'Inter (Default)'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Font Size Scale</label>
                          <p className="mt-1 text-sm text-gray-900">{typographySettings.fontSizeScale || 'Default'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Line Height</label>
                          <p className="mt-1 text-sm text-gray-900">{typographySettings.lineHeight || 'Default'}</p>
                  </div>
                </div>
              </div>
              
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Typography Preview</h3>
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-4xl font-bold" style={{ fontFamily: typographySettings.primaryFont }}>
                            Heading 1 - Primary Font
                          </h1>
                        </div>
                        <div>
                          <h2 className="text-2xl font-semibold" style={{ fontFamily: typographySettings.primaryFont }}>
                            Heading 2 - Primary Font
                          </h2>
                        </div>
                        <div>
                          <p className="text-lg" style={{ fontFamily: typographySettings.secondaryFont }}>
                            Body text using secondary font - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
              </div>
                        <div>
                          <p className="text-sm text-gray-600" style={{ fontFamily: typographySettings.secondaryFont }}>
                            Small text using secondary font - Sed do eiusmod tempor incididunt ut labore.
                          </p>
                    </div>
                  </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-900 mb-2">⚠️ Configuration Note</h3>
                      <p className="text-sm text-yellow-800">
                        Typography settings are managed through your WordPress backend. To modify typography settings, 
                        go to your WordPress admin panel and update the theme options.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🎨</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Typography Settings Not Available</h3>
                    <p className="text-gray-600 mb-4">Unable to load typography configuration from WordPress backend.</p>
                    <button
                      onClick={loadTypographySettings}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔄 Retry Loading
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'email-templates' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Templates</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Available Email Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'Email Verification', description: 'Welcome email with verification link', icon: '✉️' },
                        { name: 'Welcome Email', description: 'Post-verification welcome message', icon: '🎉' },
                        { name: 'Password Reset', description: 'Password reset instructions', icon: '🔐' },
                        { name: 'Order Confirmation', description: 'Order confirmation and details', icon: '📦' },
                        { name: 'Shipping Notification', description: 'Order shipped notification', icon: '🚚' },
                        { name: 'Order Delivered', description: 'Order delivery confirmation', icon: '✅' }
                      ].map((template) => (
                        <div key={template.name} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">{template.icon}</span>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                      ))}
              </div>
            </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Template Preview</h3>
                    <p className="text-sm text-blue-800 mb-4">
                      You can preview all email templates by visiting the email templates preview page.
                    </p>
                    <a
                      href="/email-templates-preview.html"
                      target="_blank"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      👁️ Preview Templates
                    </a>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2">✅ Template Features</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Beautiful, responsive HTML design</li>
                      <li>• Automatic fallback to plain text</li>
                      <li>• Customizable colors and branding</li>
                      <li>• Mobile-optimized layouts</li>
                      <li>• Security features and expiration handling</li>
                      <li>• Multi-language support ready</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rate-limiting' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Rate Limiting Management</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">ℹ️</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Rate Limiting Information</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Rate limiting helps prevent API abuse and ensures fair usage. Current limits:</p>
                          <ul className="mt-2 list-disc list-inside space-y-1">
                            <li><strong>Development:</strong> 60 requests per minute</li>
                            <li><strong>Production:</strong> 10 requests per minute</li>
                            <li><strong>Window:</strong> 1 minute rolling window</li>
                          </ul>
                        </div>
              </div>
                    </div>
                  </div>

                  {isDevelopment() && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-sm">⚠️</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>You're in development mode. You can clear rate limits if needed for testing.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Rate Limit Actions</h3>
                    <div className="space-y-3">
                      {isDevelopment() ? (
                        <button
                          onClick={async () => {
                            try {
                              const success = await clearRateLimits();
                              if (success) {
                                showSuccess('Rate limits cleared successfully!');
                              } else {
                                showError('Failed to clear rate limits');
                              }
                            } catch (error) {
                              showError('Error clearing rate limits: ' + error.message);
                            }
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <span className="mr-2">🔄</span>
                          Clear Rate Limits
                        </button>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Rate limit clearing is only available in development mode.
                  </div>
                )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Rate Limit Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Current Environment</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isDevelopment() 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isDevelopment() ? 'Development' : 'Production'}
                        </span>
              </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Rate Limit</span>
                        <span className="text-sm font-medium text-gray-900">
                          {isDevelopment() ? '60 requests/minute' : '10 requests/minute'}
                        </span>
                </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Window</span>
                        <span className="text-sm font-medium text-gray-900">1 minute</span>
                </div>
              </div>
            </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Troubleshooting</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>If you're getting 429 errors:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Wait a moment before making more requests</li>
                        <li>Check if you're making too many requests in a short time</li>
                        <li>In development mode, you can clear rate limits using the button above</li>
                        <li>Consider implementing request batching or caching</li>
                      </ul>
          </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Access Control</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Admin Dashboard Access</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Restricted
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">API Rate Limiting</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Enabled
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">CORS Protection</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Configured
                </span>
              </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-medium text-yellow-900 mb-2">⚠️ Security Recommendations</h3>
                    <ul className="text-sm text-yellow-800 space-y-2">
                      <li>• Change default admin credentials in production</li>
                      <li>• Enable HTTPS for all communications</li>
                      <li>• Regularly update WordPress and plugins</li>
                      <li>• Monitor failed login attempts</li>
                      <li>• Use strong SMTP credentials</li>
                      <li>• Implement proper backup strategies</li>
                    </ul>
                </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-medium text-red-900 mb-2">🚨 Important Security Notes</h3>
                    <ul className="text-sm text-red-800 space-y-2">
                      <li>• This admin dashboard is only accessible to authorized users</li>
                      <li>• All API endpoints require proper authentication</li>
                      <li>• SMTP credentials are stored securely in WordPress</li>
                      <li>• Email verification tokens expire after 24 hours</li>
                      <li>• Password reset links expire after 1 hour</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { generateBrandedEmailTemplate } from '../lib/emailTemplates/branding';
import { EMAIL_TEMPLATE_TYPES } from '../lib/emailTemplates';

export default function EmailPreview() {
  const [selectedTemplate, setSelectedTemplate] = useState('admin_contact_notification');
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branding, setBranding] = useState(null);

  // Sample data for different templates
  const sampleData = {
    // Contact & Support Templates
    admin_contact_notification: {
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      customerPhone: '+1 (555) 123-4567',
      subject: 'Product Inquiry',
      message: 'Hi, I\'m interested in your premium products. Could you please provide more information about pricing and availability? I\'m looking to make a bulk purchase for my business.',
      inquiryType: 'sales',
      submissionTime: new Date().toLocaleString()
    },
    thank_you_contact: {
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      subject: 'Product Inquiry',
      inquiryType: 'sales'
    },
    
    // Authentication & Account Templates
    email_verification: {
      userName: 'John Doe',
      verificationLink: 'https://example.com/verify?token=abc123',
      verificationCode: '123456',
      expiresIn: '24 hours'
    },
    welcome: {
      userName: 'John Doe',
      loginLink: 'https://example.com/login',
      accountLink: 'https://example.com/account'
    },
    password_reset: {
      userName: 'John Doe',
      resetLink: 'https://example.com/reset?token=xyz789',
      expiresIn: '1 hour'
    },
    password_reset_success: {
      userName: 'John Doe',
      loginLink: 'https://example.com/login'
    },
    account_locked: {
      userName: 'John Doe',
      reason: 'Multiple failed login attempts',
      unlockLink: 'https://example.com/unlock?token=unlock123'
    },
    security_alert: {
      userName: 'John Doe',
      alertType: 'Unusual Login Activity',
      details: 'Login from new device: Chrome on Windows 10',
      actionRequired: 'Please verify this was you by clicking the link below'
    },
    
    // E-commerce & Orders Templates
    order_confirmation: {
      userName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      orderDetails: `
        <ul>
          <li>Premium Product A - Qty: 2 - $99.99 each</li>
          <li>Premium Product B - Qty: 1 - $149.99</li>
        </ul>
      `,
      totalAmount: '$349.97'
    },
    order_shipped: {
      userName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: 'December 25, 2024'
    },
    order_delivered: {
      userName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      deliveryDate: 'December 24, 2024'
    },
    order_cancelled: {
      userName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      reason: 'Customer requested cancellation',
      refundInfo: 'Refund will be processed within 3-5 business days'
    },
    payment_success: {
      userName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      amount: '$349.97',
      paymentMethod: 'Credit Card (**** 1234)'
    },
    payment_failed: {
      userName: 'John Doe',
      orderNumber: 'ORD-2024-001',
      amount: '$349.97',
      reason: 'Insufficient funds'
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateBrandedEmailTemplate(selectedTemplate, sampleData[selectedTemplate]);
      setEmailContent(result.html);
      setBranding(result.branding);
    } catch (err) {
      setError(err.message);
      console.error('Error generating email preview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePreview();
  }, [selectedTemplate]);

  const templateOptions = Object.entries(EMAIL_TEMPLATE_TYPES).map(([key, value]) => ({
    key: value,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: key.includes('CONTACT') ? 'Contact & Support' : 
              key.includes('ORDER') || key.includes('PAYMENT') ? 'E-commerce & Orders' : 
              'Authentication & Account'
  }));

  // Group templates by category
  const groupedTemplates = templateOptions.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <>
      <Head>
        <title>Email Template Preview - NextGen Ecommerce</title>
        <meta name="description" content="Preview email templates with dynamic branding" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Template Preview</h1>
              <p className="text-lg text-gray-600">
                Preview email templates with dynamic branding from WordPress backend
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Template Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h2>
                
                <div className="space-y-4">
                  {Object.entries(groupedTemplates).map(([category, templates]) => (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {templates.map((option) => (
                          <button
                            key={option.key}
                            onClick={() => setSelectedTemplate(option.key)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              selectedTemplate === option.key
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={generatePreview}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Generating...' : 'Refresh Preview'}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Branding Info */}
              {branding && (
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding Info</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Site Name:</span>
                      <span className="ml-2 text-gray-900">{branding.siteName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Site URL:</span>
                      <span className="ml-2 text-gray-900">{branding.siteUrl}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Support Email:</span>
                      <span className="ml-2 text-gray-900">{branding.supportEmail}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="ml-2 text-gray-900">{branding.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Primary Color:</span>
                      <span className="ml-2 text-gray-900">{branding.primaryColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email Preview */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {templateOptions.find(t => t.key === selectedTemplate)?.label} Preview
                  </h2>
                  <div className="text-sm text-gray-500">
                    {branding ? 'Dynamic branding applied' : 'Loading branding...'}
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Generating preview...</span>
                  </div>
                ) : emailContent ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="ml-4 text-sm text-gray-600">Email Preview</span>
                      </div>
                    </div>
                    <div 
                      className="email-preview-container"
                      dangerouslySetInnerHTML={{ __html: emailContent }}
                      style={{ 
                        maxHeight: '600px', 
                        overflowY: 'auto',
                        transform: 'scale(0.8)',
                        transformOrigin: 'top left',
                        width: '125%'
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No preview available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .email-preview-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .email-preview-container * {
          box-sizing: border-box;
        }
        
        .email-preview-container img {
          max-width: 100%;
          height: auto;
        }
        
        .email-preview-container table {
          border-collapse: collapse;
          width: 100%;
        }
        
        .email-preview-container a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}

import React, { useState } from 'react';
import { generateEmailTemplate, EMAIL_TEMPLATE_TYPES } from '../lib/emailTemplates';

export default function EmailTemplatesTest() {
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION);
  const [templateData, setTemplateData] = useState({
    userName: 'John Doe',
    verificationLink: 'https://example.com/verify?token=abc123',
    verificationCode: '123456',
    expiresIn: '24 hours',
    resetLink: 'https://example.com/reset?token=xyz789',
    orderNumber: 'ORD-2024-001',
    orderDetails: '<p>Product: Sample Product</p><p>Quantity: 2</p><p>Price: $29.99</p>',
    totalAmount: '$59.98'
  });

  const handleTemplateChange = (templateType) => {
    setSelectedTemplate(templateType);
  };

  const handleDataChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTemplatePreview = () => {
    try {
      const template = generateEmailTemplate(selectedTemplate, templateData);
      return template.html;
    } catch (error) {
      return `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`;
    }
  };

  const getTemplateFields = () => {
    switch (selectedTemplate) {
      case EMAIL_TEMPLATE_TYPES.EMAIL_VERIFICATION:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'verificationLink', label: 'Verification Link', type: 'url' },
          { key: 'verificationCode', label: 'Verification Code', type: 'text' },
          { key: 'expiresIn', label: 'Expires In', type: 'text' }
        ];
      case EMAIL_TEMPLATE_TYPES.WELCOME:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'loginLink', label: 'Login Link', type: 'url' },
          { key: 'accountLink', label: 'Account Link', type: 'url' }
        ];
      case EMAIL_TEMPLATE_TYPES.PASSWORD_RESET:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'resetLink', label: 'Reset Link', type: 'url' },
          { key: 'expiresIn', label: 'Expires In', type: 'text' }
        ];
      case EMAIL_TEMPLATE_TYPES.ORDER_CONFIRMATION:
        return [
          { key: 'userName', label: 'User Name', type: 'text' },
          { key: 'orderNumber', label: 'Order Number', type: 'text' },
          { key: 'orderDetails', label: 'Order Details', type: 'textarea' },
          { key: 'totalAmount', label: 'Total Amount', type: 'text' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Email Templates Test</h1>
            <p className="text-gray-600 mt-1">Preview and test email templates in HTML format</p>
          </div>

          <div className="flex">
            {/* Left Sidebar - Template Selection */}
            <div className="w-1/4 border-r border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Template</h2>
              <div className="space-y-2">
                {Object.entries(EMAIL_TEMPLATE_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateChange(value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedTemplate === value
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Data</h3>
                <div className="space-y-4">
                  {getTemplateFields().map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={templateData[field.key] || ''}
                          onChange={(e) => handleDataChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={templateData[field.key] || ''}
                          onChange={(e) => handleDataChange(field.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Template Preview */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Template Preview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const template = generateEmailTemplate(selectedTemplate, templateData);
                      navigator.clipboard.writeText(template.html);
                      alert('HTML copied to clipboard!');
                    }}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Copy HTML
                  </button>
                  <button
                    onClick={() => {
                      const template = generateEmailTemplate(selectedTemplate, templateData);
                      const newWindow = window.open();
                      newWindow.document.write(template.html);
                      newWindow.document.close();
                    }}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-2 text-sm text-gray-600">Email Preview</span>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <div 
                    className="email-preview"
                    dangerouslySetInnerHTML={{ __html: getTemplatePreview() }}
                    style={{ maxHeight: '600px', overflow: 'auto' }}
                  />
                </div>
              </div>

              {/* Template Info */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Template Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Template:</strong> {selectedTemplate}</p>
                  <p><strong>Subject:</strong> {generateEmailTemplate(selectedTemplate, templateData).subject}</p>
                  <p><strong>Type:</strong> {selectedTemplate.includes('verification') ? 'Verification' : selectedTemplate.includes('welcome') ? 'Welcome' : selectedTemplate.includes('password') ? 'Password Reset' : 'Order'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

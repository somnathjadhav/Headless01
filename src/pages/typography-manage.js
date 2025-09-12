import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import SEO from '../components/layout/SEO';

export default function TypographyManagePage() {
  const [typography, setTypography] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current typography settings
  useEffect(() => {
    async function fetchTypography() {
      try {
        setLoading(true);
        const response = await fetch('/api/typography-manage');
        if (!response.ok) {
          throw new Error('Failed to fetch typography settings');
        }
        const data = await response.json();
        setTypography(data.typography);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTypography();
  }, []);

  // Handle typography changes
  const handleTypographyChange = (section, key, value) => {
    setTypography(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Handle font family changes
  const handleFontChange = (fontType, property, value) => {
    setTypography(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontType]: {
          ...prev.fonts[fontType],
          [property]: value
        }
      }
    }));
  };

  // Save typography settings
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      const response = await fetch('/api/typography-manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ typography }),
      });

      if (!response.ok) {
        throw new Error('Failed to save typography settings');
      }

      setMessage('Typography settings saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      const response = await fetch('/api/typography-manage', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset typography settings');
      }

      // Reload the page to get fresh defaults
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading typography settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Typography Management - Eternitty</title>
        <meta name="description" content="Manage typography settings for your headless WordPress site" />
      </Head>
      
      <SEO 
        title="Typography Management"
        description="Manage typography settings for your headless WordPress site"
        canonical="/typography-manage"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Typography Management</h1>
              <p className="mt-2 text-gray-600">
                Manage typography settings for your headless WordPress site without requiring a plugin.
              </p>
            </div>

            <div className="p-6">
              {message && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{message}</p>
                    </div>
                  </div>
                </div>
              )}

              {typography && (
                <div className="space-y-8">
                  {/* Font Families */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Families</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Primary Font */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Primary Font</label>
                        <input
                          type="text"
                          value={typography.fonts.primary.family}
                          onChange={(e) => handleFontChange('primary', 'family', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Inter, Roboto, Open Sans"
                        />
                        <p className="text-xs text-gray-500">Main font for headings and important text</p>
                      </div>

                      {/* Secondary Font */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Secondary Font</label>
                        <input
                          type="text"
                          value={typography.fonts.secondary.family}
                          onChange={(e) => handleFontChange('secondary', 'family', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Nunito Sans, Lato, Poppins"
                        />
                        <p className="text-xs text-gray-500">Font for body text and secondary content</p>
                      </div>

                      {/* Mono Font */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Mono Font</label>
                        <input
                          type="text"
                          value={typography.fonts.mono.family}
                          onChange={(e) => handleFontChange('mono', 'family', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., JetBrains Mono, Fira Code"
                        />
                        <p className="text-xs text-gray-500">Font for code and monospace text</p>
                      </div>
                    </div>
                  </div>

                  {/* Font Sizes */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Font Sizes</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(typography.sizes).map(([size, value]) => (
                        <div key={size} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 capitalize">{size}</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleTypographyChange('sizes', size, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1rem, 16px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Colors</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-3">Text Colors</h3>
                        <div className="space-y-3">
                          {Object.entries(typography.colors.text).map(([color, value]) => (
                            <div key={color} className="flex items-center space-x-3">
                              <label className="block text-sm font-medium text-gray-700 capitalize w-20">{color}</label>
                              <input
                                type="color"
                                value={value}
                                onChange={(e) => handleTypographyChange('colors', 'text', { ...typography.colors.text, [color]: e.target.value })}
                                className="w-12 h-8 border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleTypographyChange('colors', 'text', { ...typography.colors.text, [color]: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-3">Heading Colors</h3>
                        <div className="space-y-3">
                          {Object.entries(typography.colors.headings).map(([color, value]) => (
                            <div key={color} className="flex items-center space-x-3">
                              <label className="block text-sm font-medium text-gray-700 capitalize w-20">{color}</label>
                              <input
                                type="color"
                                value={value}
                                onChange={(e) => handleTypographyChange('colors', 'headings', { ...typography.colors.headings, [color]: e.target.value })}
                                className="w-12 h-8 border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => handleTypographyChange('colors', 'headings', { ...typography.colors.headings, [color]: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


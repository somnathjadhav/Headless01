import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ColorComparison() {
  const [backendColors, setBackendColors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBackendColors = async () => {
      try {
        const response = await fetch('/api/theme-options');
        if (response.ok) {
          const data = await response.json();
          setBackendColors(data.success ? data.data : data);
        }
      } catch (error) {
        console.error('Error fetching backend colors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBackendColors();
  }, []);

  // Frontend colors (from Tailwind config and globals.css)
  const frontendColors = {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryDarker: '#1D4ED8',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading color comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Color Scheme Comparison - Frontend vs Backend</title>
        <meta name="description" content="Compare frontend and backend color schemes" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                  ← Back to Home
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Color Scheme Comparison</h1>
              </div>
              <div className="text-sm text-gray-500">
                Frontend vs Backend Colors
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Comparison Header */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Scheme Mismatch Detected</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Frontend and Backend colors don't match!
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The frontend is using a light theme with blue colors, while the WordPress backend has a dark theme with black colors.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Frontend Colors */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend Colors (Current)</h3>
              <p className="text-sm text-gray-600 mb-4">Colors currently used in the frontend design</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: frontendColors.primary }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">Primary</p>
                    <p className="text-sm text-gray-600">{frontendColors.primary}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: frontendColors.text }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">Text</p>
                    <p className="text-sm text-gray-600">{frontendColors.text}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: frontendColors.background }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">Background</p>
                    <p className="text-sm text-gray-600">{frontendColors.background}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: frontendColors.surface }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">Surface</p>
                    <p className="text-sm text-gray-600">{frontendColors.surface}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Backend Colors */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend Colors (WordPress)</h3>
              <p className="text-sm text-gray-600 mb-4">Colors set in WordPress backend</p>
              
              {backendColors ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: backendColors.primaryColor }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">Primary</p>
                      <p className="text-sm text-gray-600">{backendColors.primaryColor}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: backendColors.textColor }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">Text</p>
                      <p className="text-sm text-gray-600">{backendColors.textColor}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: backendColors.backgroundColor }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">Background</p>
                      <p className="text-sm text-gray-600">{backendColors.backgroundColor}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: backendColors.surfaceColor }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">Surface</p>
                      <p className="text-sm text-gray-600">{backendColors.surfaceColor}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Failed to load backend colors</p>
              )}
            </div>
          </div>

          {/* Theme Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Frontend Theme Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend Theme (Light)</h3>
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: frontendColors.background,
                  borderColor: frontendColors.border,
                  color: frontendColors.text
                }}
              >
                <h4 className="text-lg font-semibold mb-2" style={{ color: frontendColors.text }}>
                  Sample Content
                </h4>
                <p className="mb-4" style={{ color: frontendColors.textSecondary }}>
                  This is how the frontend currently looks with light theme colors.
                </p>
                <button 
                  className="px-4 py-2 rounded font-medium"
                  style={{ 
                    backgroundColor: frontendColors.primary, 
                    color: 'white' 
                  }}
                >
                  Primary Button
                </button>
              </div>
            </div>

            {/* Backend Theme Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Backend Theme (Dark)</h3>
              {backendColors ? (
                <div 
                  className="p-6 rounded-lg border"
                  style={{ 
                    backgroundColor: backendColors.backgroundColor,
                    borderColor: backendColors.secondaryColor,
                    color: backendColors.textColor
                  }}
                >
                  <h4 className="text-lg font-semibold mb-2" style={{ color: backendColors.headingColor }}>
                    Sample Content
                  </h4>
                  <p className="mb-4" style={{ color: backendColors.textColor }}>
                    This is how the backend theme looks with dark colors.
                  </p>
                  <button 
                    className="px-4 py-2 rounded font-medium"
                    style={{ 
                      backgroundColor: backendColors.primaryColor, 
                      color: backendColors.backgroundColor 
                    }}
                  >
                    Primary Button
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">Failed to load backend colors</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Option 1: Update Frontend to Match Backend</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Apply the dark theme colors from WordPress backend to the frontend.
                </p>
                <Link 
                  href="/products-color-preview" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Dark Theme Preview →
                </Link>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Option 2: Update Backend to Match Frontend</h4>
                <p className="text-sm text-green-800 mb-2">
                  Update WordPress backend colors to match the current light theme.
                </p>
                <p className="text-sm text-green-700">
                  Go to WordPress Admin → Headless Pro → Theme Options
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Option 3: Create New Color Scheme</h4>
                <p className="text-sm text-purple-800 mb-2">
                  Design a new color scheme that works well for both frontend and backend.
                </p>
                <p className="text-sm text-purple-700">
                  Consider accessibility, brand colors, and user experience.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link 
              href="/products-color-preview" 
              className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
            >
              View Dark Theme Preview
            </Link>
            <Link 
              href="/typography" 
              className="bg-gray-600 text-white px-6 py-2 rounded font-medium hover:bg-gray-700 transition-colors"
            >
              Typography Preview
            </Link>
            <Link 
              href="/" 
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TypographyPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [themeOptions, setThemeOptions] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchThemeOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/theme-options');
      if (response.ok) {
        const data = await response.json();
        setThemeOptions(data.success ? data.data : data);
      }
    } catch (error) {
      console.error('Error fetching theme options:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !themeOptions) {
      fetchThemeOptions();
    }
  }, [isOpen, themeOptions]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Show Typography & Colors Preview"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <h3 className="font-semibold text-gray-900">Typography & Colors Preview</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto max-h-80">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        ) : themeOptions ? (
          <div className="space-y-4">
            {/* Color Palette */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: themeOptions.primaryColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Primary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: themeOptions.secondaryColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Secondary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: themeOptions.accentColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Accent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: themeOptions.textColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Text</span>
                </div>
              </div>
            </div>

            {/* Typography Examples */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Typography</h4>
              <div className="space-y-2">
                <div 
                  style={{
                    fontFamily: themeOptions.h1Font,
                    fontSize: '16px',
                    fontWeight: themeOptions.h1Weight,
                    color: themeOptions.headingColor
                  }}
                  className="text-xs"
                >
                  H1: {themeOptions.h1Font}
                </div>
                <div 
                  style={{
                    fontFamily: themeOptions.h2Font,
                    fontSize: '14px',
                    fontWeight: themeOptions.h2Weight,
                    color: themeOptions.headingColor
                  }}
                  className="text-xs"
                >
                  H2: {themeOptions.h2Font}
                </div>
                <div 
                  style={{
                    fontFamily: themeOptions.bodyFont,
                    fontSize: '12px',
                    fontWeight: themeOptions.bodyWeight,
                    color: themeOptions.textColor
                  }}
                  className="text-xs"
                >
                  Body: {themeOptions.bodyFont}
                </div>
              </div>
            </div>

            {/* Quick Preview */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Quick Preview</h4>
              <div 
                className="p-2 rounded text-xs"
                style={{ 
                  backgroundColor: themeOptions.surfaceColor,
                  color: themeOptions.textColor,
                  fontFamily: themeOptions.primaryFont
                }}
              >
                Sample text with your theme colors and typography
              </div>
            </div>

            {/* View Full Page */}
            <div className="pt-2 border-t">
              <Link
                href="/typography"
                className="block w-full text-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                View Full Typography Page →
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Failed to load theme options</p>
            <button
              onClick={fetchThemeOptions}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

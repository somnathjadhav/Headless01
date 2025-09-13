import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TypographyDemo() {
  return (
    <>
      <Head>
        <title>Typography Preview Demo - WordPress Theme Settings</title>
        <meta name="description" content="Demo page showing typography and colors preview functionality" />
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
                <h1 className="text-2xl font-bold text-gray-900">Typography Preview Demo</h1>
              </div>
              <div className="text-sm text-gray-500">
                Click the floating button to see preview
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Use the Typography Preview</h2>
            <div className="space-y-2 text-blue-800">
              <p>1. Look for the floating button in the bottom-right corner of your screen</p>
              <p>2. Click the button to open the typography and colors preview panel</p>
              <p>3. The preview shows your WordPress theme colors and typography in real-time</p>
              <p>4. Click "View Full Typography Page" to see the complete typography showcase</p>
            </div>
          </div>

          {/* Sample Content */}
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sample Content</h2>
              <p className="text-gray-600 mb-4">
                This page demonstrates how the typography preview works. The floating preview button 
                appears on every page and shows a quick overview of your WordPress theme settings.
              </p>
              <p className="text-gray-600 mb-4">
                You can see your theme colors, typography settings, and even a quick preview of how 
                text looks with your chosen fonts and colors.
              </p>
            </section>

            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real-time color palette display
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Typography examples with your fonts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Quick preview of theme colors in action
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Direct link to full typography page
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Try It Now</h3>
              <p className="text-gray-600 mb-4">
                Look for the floating button in the bottom-right corner of this page. 
                Click it to see your WordPress theme colors and typography in action!
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-mono">
                  💡 Tip: The preview button appears on every page of your site, 
                  so you can check your typography and colors from anywhere.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Navigation</h3>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/typography" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Full Typography Page
                </Link>
                <Link 
                  href="/" 
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Homepage
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

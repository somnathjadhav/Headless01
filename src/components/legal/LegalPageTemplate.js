import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { BreadcrumbWithTitle } from '../ui/Breadcrumb';

/**
 * Reusable template for legal pages
 * Prevents duplicate header/footer issues by properly using the Layout component
 */
export default function LegalPageTemplate({ 
  title, 
  excerpt, 
  content, 
  // modified, 
  loading = false, 
  error = null 
}) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">The requested page could not be found.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Content Available</h1>
          <p className="text-gray-600 mb-4">This page doesn&apos;t have any content yet.</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} - Your WordPress Site</title>
        <meta name="description" content={excerpt || `Read our ${title.toLowerCase()}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt || `Read our ${title.toLowerCase()}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={excerpt || `Read our ${title.toLowerCase()}`} />
      </Head>

      {/* Beautiful Title Bar with Breadcrumbs */}
      <BreadcrumbWithTitle 
        title={title}
        className="bg-gradient-to-r from-purple-50 to-pink-50"
        titleClassName="text-3xl font-bold text-gray-900 text-center"
      />

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/')}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
}

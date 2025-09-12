import React from 'react';
import Link from 'next/link';
import { useGlobalTypography } from '../hooks/useGlobalTypography';

export default function Custom404() {
  // Apply global typography
  useGlobalTypography();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
          
          <Link
            href="/products"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Browse Products
          </Link>
          
          <Link
            href="/blog"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Read Blog
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}


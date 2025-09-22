import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGlobalTypography } from '../hooks/useGlobalTypography';

export default function Custom404() {
  // Apply global typography
  useGlobalTypography();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => router.back()}
            className="block w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Simple Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


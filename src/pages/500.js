import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Custom500() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-lg font-medium text-gray-900 mb-2">
            Server Error
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Something went wrong on our end. We're working to fix this issue. Please try again later.
          </p>
          
          <p className="text-xs text-gray-500 mb-4">
            Error Code: 500
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Go Back
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

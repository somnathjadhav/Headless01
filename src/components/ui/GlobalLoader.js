import React from 'react';
import { useWooCommerce } from '../../context/WooCommerceContext';

export default function GlobalLoader() {
  const { loading } = useWooCommerce();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Animated Spinner */}
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          
          {/* Loading Text */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing...</h3>
          <p className="text-gray-600 text-sm">Please wait while we process your request</p>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

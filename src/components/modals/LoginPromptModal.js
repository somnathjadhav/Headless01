import React from 'react';
import Link from 'next/link';
import { HeartIcon, XMarkIcon } from '../icons';

/**
 * Modal component to prompt users to login for wishlist functionality
 */
export default function LoginPromptModal({ isOpen, onClose, title = "Sign in to use wishlist", message = "Please sign in to add items to your wishlist and save them for later." }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">With an account you can:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-3"></div>
                  Save items to your wishlist
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-3"></div>
                  Access your wishlist from any device
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-3"></div>
                  Get notified about price changes
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-3"></div>
                  Track your order history
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Link
                href="/account?tab=login"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
              >
                Sign In
              </Link>
              
              <Link
                href="/account?tab=register"
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-center"
              >
                Create Account
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Don't worry, creating an account is quick and free!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

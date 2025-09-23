import React from 'react';
import Link from 'next/link';
import { 
  ExclamationIcon,
  UserIcon,
  LockClosedIcon
} from '../icons';

export default function PleaseSignIn({ 
  title = "Please Sign In", 
  message = "You need to be signed in to access this content.",
  showSignUp = true,
  redirectTo = null 
}) {
  const signInUrl = redirectTo ? `/signin?redirect=${encodeURIComponent(redirectTo)}` : '/signin';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-8 shadow-lg">
            <ExclamationIcon className="h-12 w-12 text-blue-600" />
          </div>
          
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            {message}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link
              href={signInUrl}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-gradient-to-r from-black to-gray-800 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-lg"
            >
              <UserIcon className="h-5 w-5 mr-3" />
              Sign In
            </Link>
            
            {showSignUp && (
              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <LockClosedIcon className="h-5 w-5 mr-3" />
                Create Account
              </Link>
            )}
          </div>
          
          {/* Additional Info */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-lg text-gray-500">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="font-semibold text-black hover:text-gray-700 transition-colors underline decoration-2 underline-offset-2"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why sign in?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Access your order history</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Save items to your wishlist</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Track your orders</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Manage your account settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

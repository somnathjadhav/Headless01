import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { checkWordPressConnection } from '../lib/wordpress-api';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { SkeletonStatusCard, SkeletonSpinner } from '../components/ui/SkeletonLoader';

/**
 * Home Page - Showcases the headless WordPress setup
 */
export default function HomePage() {
  const [wpStatus, setWpStatus] = useState(null);
  const [wcStatus, setWcStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // Apply global typography
  useGlobalTypography();

  // Check WordPress status on mount with optimized single API call
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      try {
        // Use combined status endpoint for better performance
        const response = await fetch('/api/status/combined');
        const data = await response.json();
        
        if (data.success && data.data) {
          setWpStatus(data.data.wordpress.status === 'online');
          setWcStatus(data.data.woocommerce.status === 'online');
        } else {
          setWpStatus(false);
          setWcStatus(false);
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setWpStatus(false);
        setWcStatus(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              🎯 Eternitty Headless WordPress
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              A modern, headless WordPress solution built with Next.js and REST API.
              Experience lightning-fast performance with the power of headless architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Read Blog
              </Link>
              <a
                href="https://developer.wordpress.org/rest-api/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            System Status
          </h2>
          <p className="text-gray-600 mb-4">
            Quick overview of your headless WordPress infrastructure
          </p>
          <Link
            href="/status"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View Detailed Status →
          </Link>
        </div>
        
        {isChecking ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonStatusCard />
            <SkeletonStatusCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WordPress Status */}
            <div className={`p-6 rounded-lg border-2 ${
              wpStatus 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  wpStatus ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <h3 className="text-lg font-semibold">WordPress Backend</h3>
              </div>
              <p className={`mt-2 ${
                wpStatus ? 'text-green-700' : 'text-red-700'
              }`}>
                {wpStatus 
                  ? '✅ Connected and accessible' 
                  : '❌ Connection failed - check your WordPress backend'
                }
              </p>
            </div>

            {/* WooCommerce Status */}
            <div className={`p-6 rounded-lg border-2 ${
              wcStatus 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  wcStatus ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <h3 className="text-lg font-semibold">WooCommerce</h3>
              </div>
              <p className={`mt-2 ${
                wcStatus ? 'text-green-700' : 'text-red-700'
              }`}>
                {wcStatus 
                  ? '✅ Active and ready' 
                  : '❌ Not active - install and activate WooCommerce plugin'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Headless WordPress?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Decoupled frontend and backend for optimal performance and user experience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Developer Friendly</h3>
              <p className="text-gray-600">
                Built with modern technologies like React, Next.js, and REST API for easy customization.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Scalable</h3>
              <p className="text-gray-600">
                Handle high traffic and complex requirements with ease.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Explore our blog and experience the power of headless WordPress.
          </p>
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Read Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

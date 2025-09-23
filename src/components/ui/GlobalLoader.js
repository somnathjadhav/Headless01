import React, { useState, useEffect } from 'react';
import { useWooCommerce } from '../../context/WooCommerceContext';

export default function GlobalLoader() {
  const { loading } = useWooCommerce();
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    // Simulate progress with realistic loading messages
    const messages = [
      'Initializing...',
      'Loading data...',
      'Processing request...',
      'Almost done...',
      'Finalizing...'
    ];

    let currentMessageIndex = 0;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5; // Random increment between 5-20
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    const messageInterval = setInterval(() => {
      setLoadingMessage(messages[currentMessageIndex]);
      currentMessageIndex = (currentMessageIndex + 1) % messages.length;
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20">
        <div className="text-center">
          {/* Modern Animated Spinner */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-indigo-600 border-l-pink-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
          </div>
          
          {/* Loading Text with Animation */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-pulse">
            {loadingMessage}
          </h3>
          <p className="text-gray-600 text-sm mb-6">Please wait while we process your request</p>
          
          {/* Modern Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="text-sm text-gray-500 font-medium">
            {Math.round(progress)}%
          </div>
          
          {/* Modern Progress Dots */}
          <div className="flex justify-center space-x-3 mt-6">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              ></div>
            ))}
          </div>
          
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}

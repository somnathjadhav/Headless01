import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useWooCommerce } from '../context/WooCommerceContext';

export default function Custom404() {
  // Apply global typography
  useGlobalTypography();
  
  const router = useRouter();
  const { searchProducts } = useWooCommerce();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedPages, setSuggestedPages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Popular pages and categories for suggestions
  const popularPages = [
    { name: 'Shop All Products', href: '/products', icon: '🛍️', color: 'from-blue-500 to-blue-600' },
    { name: 'Men\'s Fashion', href: '/products?category=men', icon: '👔', color: 'from-gray-600 to-gray-700' },
    { name: 'Women\'s Fashion', href: '/products?category=women', icon: '👗', color: 'from-pink-500 to-pink-600' },
    { name: 'Kids Collection', href: '/products?category=kids', icon: '👶', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Contact Us', href: '/contact', icon: '📞', color: 'from-green-500 to-green-600' },
    { name: 'About Us', href: '/about', icon: 'ℹ️', color: 'from-purple-500 to-purple-600' },
    { name: 'Blog', href: '/blog', icon: '📝', color: 'from-indigo-500 to-indigo-600' },
    { name: 'My Account', href: '/account', icon: '👤', color: 'from-orange-500 to-orange-600' }
  ];

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchProducts(searchTerm, 6);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get random suggested pages
  useEffect(() => {
    const shuffled = [...popularPages].sort(() => 0.5 - Math.random());
    setSuggestedPages(shuffled.slice(0, 4));
    
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Main 404 Section */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-12">
              {/* Animated 404 Number */}
              <div className="relative mb-8">
                <div className="text-9xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4 animate-bounce">
                  404
                </div>
                <div className="absolute inset-0 text-9xl font-black text-white opacity-10 blur-sm animate-pulse">
                  404
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Oops! Page Not Found
              </h1>
              <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
                The page you're looking for seems to have wandered off into the digital void. 
                Don't worry, we'll help you find what you need!
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-lg mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative group">
                <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-2xl">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for products, pages, or anything..."
                    className="flex-1 px-6 py-4 bg-transparent text-white placeholder-purple-200 focus:outline-none rounded-xl"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isSearching ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <Link
                href="/"
                className="group bg-gradient-to-r from-white to-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:from-gray-100 hover:to-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Link>
              <Link
                href="/products"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Support
              </Link>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className={`mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Search Results for "{searchTerm}"
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white/10 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-white/20 hover:border-white/40 transform hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-white/20 to-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      {product.images?.[0]?.src ? (
                        <img
                          src={product.images[0].src}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-white/60 text-4xl">📦</div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-purple-300 font-medium">
                      {product.price_html || 'Price not available'}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Suggested Pages */}
          <div className={`mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Popular Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedPages.map((page, index) => (
                <Link
                  key={index}
                  href={page.href}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center border border-white/20 hover:border-white/40 transform hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${page.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-2xl">{page.icon}</span>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                    {page.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

          {/* Enhanced Help Section */}
          <div className={`bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-12 text-center border border-white/20 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-white mb-6">Still Can't Find What You're Looking For?</h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Our support team is here to help! Get in touch with us and we'll assist you in finding what you need.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/contact"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="group bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View FAQ
              </Link>
              <button
                onClick={() => router.back()}
                className="group bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center border border-white/30"
              >
                <svg className="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            </div>
          </div>

          {/* Fun 404 Illustration */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-8xl mb-6 animate-bounce">🔍</div>
            <p className="text-purple-300 text-lg">
              Even our best detectives couldn't find this page! 🕵️‍♂️
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}


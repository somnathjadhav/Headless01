import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalTypography } from '../hooks/useGlobalTypography';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useCurrency } from '../context/CurrencyContext';
import { usePosts } from '../hooks/usePosts';
import ProductCard from '../components/woocommerce/ProductCard';
import CategoryCard from '../components/woocommerce/CategoryCard';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  ArrowRightIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  FireIcon,
  GiftIcon
} from '../components/icons';

/**
 * Home Page - Modern E-commerce Homepage with all sections
 */
export default function HomePage() {
  const [wpStatus, setWpStatus] = useState(null);
  const [wcStatus, setWcStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  
  // WooCommerce data
  const { products, categories, fetchProducts, fetchCategories } = useWooCommerce();
  const { formatPrice } = useCurrency();
  
  // Blog posts
  const { posts, fetchPosts } = usePosts(3);
  
  // Local state
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply global typography
  useGlobalTypography();

  // Load homepage data
  useEffect(() => {
    const loadHomepageData = async () => {
      setLoading(true);
      try {
        // Load products and categories
        await Promise.all([
          fetchProducts(1, 12), // Load 12 products
          fetchCategories(),
          fetchPosts(1, 3) // Load 3 blog posts
        ]);
        
        // Simulate product categorization (in real app, this would come from API)
        if (products.length > 0) {
          setFeaturedProducts(products.slice(0, 4));
          setNewArrivals(products.slice(4, 8));
          setPopularProducts(products.slice(8, 12));
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageData();
  }, [fetchProducts, fetchCategories, fetchPosts, products]);

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
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-1"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <SparklesIcon className="w-4 h-4 mr-2" />
                New Collection Available
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover Your
                <span className="block bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  Perfect Style
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto lg:mx-0">
                Explore our curated collection of premium fashion, lifestyle products, and exclusive deals. 
                Shop with confidence and express your unique style.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Shop Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Browse Categories
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 p-8">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <ShoppingCartIcon className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-white/80 font-medium">Premium Products</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60 animate-bounce"></div>
            </div>
          </div>
      </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">You will love at great low prices.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Returns</h3>
              <p className="text-gray-600 text-sm">Within 15 days for an exchange.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Payment</h3>
              <p className="text-gray-600 text-sm">Pay with multiple credit cards.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Online</h3>
              <p className="text-gray-600 text-sm">Outstanding premium support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our curated collections designed to match your unique style
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              href="/categories"
              className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
            >
              View All Categories
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-lg text-gray-600">Fresh styles just landed in our store</p>
            </div>
            <Link
              href="/products?filter=new"
              className="inline-flex items-center text-gray-900 hover:text-gray-700 font-medium mt-4 sm:mt-0"
            >
              View All
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                  <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner Offers Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summer Sale Banner */}
            <div className="relative bg-gradient-to-br from-pink-500 to-red-500 rounded-3xl p-8 sm:p-12 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                  <FireIcon className="w-4 h-4 mr-2" />
                  Limited Time Offer
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Summer Sale
                  <span className="block text-yellow-300">Up to 50% Off</span>
                </h3>
                
                <p className="text-lg mb-6 opacity-90">
                  Refresh your wardrobe with our hottest summer collection
                </p>
                
                <Link
                  href="/products?sale=true"
                  className="inline-flex items-center px-6 py-3 bg-white text-pink-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Shop Sale
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
            
            {/* New Collection Banner */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 -translate-x-20"></div>
              <div className="absolute bottom-0 right-0 w-28 h-28 bg-white/10 rounded-full translate-y-14 translate-x-14"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Just Launched
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  New Collection
                  <span className="block text-cyan-300">Trending Now</span>
                </h3>
                
                <p className="text-lg mb-6 opacity-90">
                  Discover the latest fashion trends and exclusive designs
                </p>
                
                <Link
                  href="/products?filter=new"
                  className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                >
                  Explore Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Best Sellers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unmatched design—superior performance and customer satisfaction in one.
            </p>
      </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="w-full h-64 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">The Blog</h2>
              <p className="text-lg text-gray-600">Provide you with useful knowledge about fashion trend.</p>
            </div>
          <Link
            href="/blog"
              className="inline-flex items-center text-gray-900 hover:text-gray-700 font-medium mt-4 sm:mt-0"
            >
              View All Posts
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {post.featured_media ? (
                      <Image
                        src={post.featured_media.source_url}
                        alt={post.title.rendered}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                        {post.categories?.[0]?.name || 'Lifestyle'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {post.title.rendered}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt.rendered.replace(/<[^>]*>/g, '')}
                    </p>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read More
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
          </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <GiftIcon className="w-4 h-4 mr-2" />
            Exclusive Offers
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Sign Up—Big Save!
          </h2>
          
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Sign up for 10% off your first purchase and free shipping. Updates information on Sales and Offers.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-sm text-gray-400 mt-4">
            By entering the e-mail you accept the terms and conditions and the privacy policy.
          </p>
      </div>
      </section>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useWooCommerce } from '../context/WooCommerceContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNotifications } from '../context/NotificationContext';
import Wishlist from '../components/woocommerce/Wishlist';
import PleaseSignIn from '../components/auth/PleaseSignIn';
import { HeartIcon, ShoppingCartIcon, ShareIcon, FilterIcon, SortIcon } from '../components/icons';

export default function WishlistPage() {
  const { isAuthenticated, user } = useAuth();
  const { wishlist, addToCart, removeFromWishlist } = useWooCommerce();
  const { formatPrice } = useCurrency();
  const { showSuccess, showError } = useNotifications();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    }
  }, [isAuthenticated]);

  // Sort wishlist items
  const sortedWishlist = React.useMemo(() => {
    const sorted = [...wishlist];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a.price || a.regular_price) - parseFloat(b.price || b.regular_price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price || b.regular_price) - parseFloat(a.price || a.regular_price));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'date':
      default:
        return sorted; // Keep original order (most recent first)
    }
  }, [wishlist, sortBy]);

  // Filter wishlist items
  const filteredWishlist = React.useMemo(() => {
    if (filterBy === 'all') return sortedWishlist;
    
    return sortedWishlist.filter(item => {
      const price = parseFloat(item.price || item.regular_price);
      switch (filterBy) {
        case 'under-50':
          return price < 50;
        case '50-100':
          return price >= 50 && price <= 100;
        case 'over-100':
          return price > 100;
        case 'on-sale':
          return item.sale_price && parseFloat(item.sale_price) < parseFloat(item.regular_price);
        default:
          return true;
      }
    });
  }, [sortedWishlist, filterBy]);

  // Calculate total value
  const totalValue = filteredWishlist.reduce((sum, item) => {
    return sum + parseFloat(item.price || item.regular_price);
  }, 0);

  // Handle add all to cart
  const handleAddAllToCart = async () => {
    setIsLoading(true);
    try {
      for (const item of filteredWishlist) {
        await addToCart(item, 1);
      }
      showSuccess(`Added ${filteredWishlist.length} items to cart!`);
    } catch (error) {
      showError('Failed to add some items to cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share wishlist
  const handleShareWishlist = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: `Check out my wishlist with ${wishlist.length} items!`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        showSuccess('Wishlist link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Wishlist link copied to clipboard!');
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <PleaseSignIn 
        title="View Your Wishlist"
        message="Please sign in to view and manage your saved items. Your wishlist helps you keep track of products you love."
        redirectTo="wishlist"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                  <p className="text-gray-600">Save your favorite products for later</p>
                </div>
              </div>
              
              {wishlist.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4 text-pink-500" />
                    <span>{wishlist.length} items saved</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Total value: {formatPrice(totalValue)}</span>
                  </span>
                </div>
              )}
            </div>

            {wishlist.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleShareWishlist}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                {filteredWishlist.length > 0 && (
                  <button
                    onClick={handleAddAllToCart}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    <span>{isLoading ? 'Adding...' : `Add All (${filteredWishlist.length})`}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters and Sorting */}
        {wishlist.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center space-x-2">
                  <SortIcon className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Recently Added</option>
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center space-x-2">
                  <FilterIcon className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Items</option>
                    <option value="under-50">Under $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="over-100">Over $100</option>
                    <option value="on-sale">On Sale</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredWishlist.length} of {wishlist.length} items
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Content */}
        <Wishlist wishlist={filteredWishlist} />
      </div>
    </div>
  );
}

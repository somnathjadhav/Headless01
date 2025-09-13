import React from 'react';
import Link from 'next/link';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlistAuth } from '../../hooks/useWishlistAuth';
import { HeartIcon, ShoppingCartIcon, TrashIcon, StarIcon } from '../icons';
import LoginPromptModal from '../modals/LoginPromptModal';

export default function Wishlist() {
  const { wishlist, addToCart, removeFromWishlist } = useWooCommerce();
  const { formatPrice } = useCurrency();
  const { handleWishlistAction, showLoginPrompt, closeLoginPrompt } = useWishlistAuth();

  if (wishlist.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-pink-100 mb-6">
          <HeartIcon className="w-12 h-12 text-pink-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h3>
        <p className="text-gray-600 text-lg mb-6">Start curating your dream collection</p>
        <button
          onClick={() => window.location.href = '/products'}
          className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
        >
          Discover Products
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Wishlist Header */}
      <div className="bg-gradient-to-r from-pink-50 to-white px-6 py-4 border-b border-pink-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              My Wishlist
            </h2>
            <p className="text-sm text-gray-600">{wishlist.length} items saved for later</p>
          </div>
          <div className="flex items-center space-x-2 text-pink-600">
            <HeartIcon className="w-6 h-6" />
            <span className="font-semibold">Loved Items</span>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="divide-y divide-gray-100">
        {wishlist.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
            {/* Product Image */}
            <div className="flex-shrink-0 relative">
              <Link href={`/products/${item.id}`}>
                <img
                  src={item.images?.[0]?.src || '/placeholder-product.svg'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <HeartIcon className="w-3 h-3" />
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.id}`}>
                <h3 className="text-base font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer" style={{fontSize: '16px', fontWeight: '500'}}>
                  {item.name}
                </h3>
              </Link>
              {item.attributes && item.attributes.length > 0 && (
                <p className="text-sm text-gray-500 mb-1">
                  {item.attributes.map(attr => attr.name + ': ' + attr.value).join(', ')}
                </p>
              )}
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(4.8)</span>
              </div>
              <p className="text-lg font-medium text-gray-900" style={{fontWeight: '500'}}>
                {formatPrice(parseFloat(item.price || item.regular_price))}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => addToCart(item, 1)}
                className="group flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ShoppingCartIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleWishlistAction(() => removeFromWishlist(item.id), item)}
                className="group flex items-center justify-center space-x-2 text-gray-500 hover:text-red-600 px-6 py-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              >
                <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Wishlist Footer */}
      <div className="bg-gray-50 px-8 py-6 text-center">
        <p className="text-gray-600 mb-4">
          Items in your wishlist are saved for 30 days
        </p>
        <button
          onClick={() => window.location.href = '/products'}
          className="inline-flex items-center px-8 py-3 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
        >
          Continue Shopping
        </button>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title="Sign in to manage wishlist"
        message="Please sign in to remove items from your wishlist."
      />
    </div>
  );
}

import React, { useState } from 'react';
import { XIcon, HeartIcon, EyeIcon, ShoppingBagIcon } from '../icons';
import { useWooCommerce } from '../../context/WooCommerceContext';
import { useWishlistAuth } from '../../hooks/useWishlistAuth';
import LoginPromptModal from '../modals/LoginPromptModal';

export default function QuickPreviewModal({ product, isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, clearCart, backupCart, addToWishlist, isInWishlist, cart } = useWooCommerce();
  const { 
    handleWishlistAction, 
    showLoginPrompt, 
    closeLoginPrompt, 
    getWishlistButtonStyles 
  } = useWishlistAuth();

  if (!isOpen || !product) return null;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
  };

  const handleBuyNow = () => {
    // Backup existing cart items first (if any)
    if (cart.length > 0) {
      backupCart();
    }
    
    // Clear existing cart items
    clearCart();
    
    // Add the current product to the now-empty cart
    addToCart(product, quantity);
    
    // Close modal and redirect to checkout
    onClose();
    window.location.href = '/checkout';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex">
            {/* Left Side - Product Image */}
            <div className="w-1/2 p-6">
              <div className="relative">
                <img
                  src={product.images?.[0]?.src || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-auto rounded-lg"
                />
                {/* Additional Image */}
                {product.images?.[1] && (
                  <img
                    src={product.images[1].src}
                    alt={product.name}
                    className="absolute top-2 left-2 w-16 h-16 object-cover rounded border-2 border-white shadow-sm"
                  />
                )}
              </div>
            </div>

            {/* Right Side - Product Information */}
            <div className="w-1/2 p-6">
              {/* Product Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">1 review</span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ${parseFloat(product.price || 0).toFixed(2)}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.short_description ? 
                  product.short_description.replace(/<[^>]*>/g, '') : // Remove HTML tags
                  'A modern product featuring comfort and effortless style. Perfect for both casual and elevated looks.'
                }
              </p>

              {/* Quantity, Add to Cart, and Wishlist in one line */}
              <div className="flex items-center space-x-4 mb-6">
                {/* Quantity Selector */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 border border-gray-300 rounded-l flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-r flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="bg-black text-white py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Add to Cart
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistAction(handleAddToWishlist, product)}
                  className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-colors ${
                    getWishlistButtonStyles(isInWishlist(product.id)).container
                  }`}
                >
                  <HeartIcon className={`w-5 h-5 ${
                    getWishlistButtonStyles(isInWishlist(product.id)).icon
                  }`} />
                </button>
              </div>

              {/* Action Button Row 2 */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium mb-4"
              >
                Buy it now
              </button>

              {/* View Full Details Link */}
              <a
                href={`/products/${product.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                View Full Details &gt;&gt;
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={closeLoginPrompt}
        title="Sign in to use wishlist"
        message="Please sign in to add items to your wishlist and save them for later."
      />
    </div>
  );
}

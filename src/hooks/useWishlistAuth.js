import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle wishlist authentication requirements
 * Provides authentication checks and login prompts for wishlist functionality
 */
export function useWishlistAuth() {
  const { isAuthenticated, user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  /**
   * Check if user can perform wishlist actions
   * @returns {boolean} - True if user is authenticated
   */
  const canUseWishlist = () => {
    return isAuthenticated && user;
  };

  /**
   * Handle wishlist action with authentication check
   * @param {Function} action - The wishlist action to perform if authenticated
   * @param {Object} product - The product to add/remove from wishlist
   * @returns {Function} - Function to call when wishlist button is clicked
   */
  const handleWishlistAction = (action, product) => {
    return () => {
      if (canUseWishlist()) {
        action(product);
      } else {
        setShowLoginPrompt(true);
      }
    };
  };

  /**
   * Handle wishlist toggle with authentication check
   * @param {Function} addAction - Function to add to wishlist
   * @param {Function} removeAction - Function to remove from wishlist
   * @param {Object} product - The product to toggle
   * @param {boolean} isInWishlist - Whether product is currently in wishlist
   * @returns {Function} - Function to call when wishlist button is clicked
   */
  const handleWishlistToggle = (addAction, removeAction, product, isInWishlist) => {
    return () => {
      if (canUseWishlist()) {
        if (isInWishlist) {
          removeAction(product.id || product);
        } else {
          addAction(product);
        }
      } else {
        setShowLoginPrompt(true);
      }
    };
  };

  /**
   * Close the login prompt modal
   */
  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  /**
   * Get authentication status message
   * @returns {string} - Message to display when user is not authenticated
   */
  const getAuthMessage = () => {
    return 'Please sign in to add items to your wishlist';
  };

  /**
   * Get wishlist button text based on authentication status
   * @param {boolean} isInWishlist - Whether product is in wishlist
   * @returns {string} - Button text
   */
  const getWishlistButtonText = (isInWishlist) => {
    if (!canUseWishlist()) {
      return 'Sign in to Wishlist';
    }
    return isInWishlist ? 'In Wishlist' : 'Add to Wishlist';
  };

  /**
   * Get wishlist button styling based on authentication and wishlist status
   * @param {boolean} isInWishlist - Whether product is in wishlist
   * @returns {Object} - CSS classes for the button
   */
  const getWishlistButtonStyles = (isInWishlist) => {
    if (!canUseWishlist()) {
      return {
        container: 'border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100',
        icon: 'text-gray-400'
      };
    }
    
    if (isInWishlist) {
      return {
        container: 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100',
        icon: 'text-red-500'
      };
    }
    
    return {
      container: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      icon: 'text-gray-600'
    };
  };

  return {
    canUseWishlist,
    handleWishlistAction,
    handleWishlistToggle,
    showLoginPrompt,
    closeLoginPrompt,
    getAuthMessage,
    getWishlistButtonText,
    getWishlistButtonStyles,
    isAuthenticated,
    user
  };
}

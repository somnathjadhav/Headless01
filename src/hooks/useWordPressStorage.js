import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWooCommerce } from '../context/WooCommerceContext';

/**
 * Hook to automatically sync cart and wishlist with WordPress for authenticated users
 */
export function useWordPressStorage() {
  const { isAuthenticated, user } = useAuth();
  const { 
    cart, 
    wishlist, 
    saveCartToWordPress, 
    loadCartFromWordPress, 
    saveWishlistToWordPress, 
    loadWishlistFromWordPress 
  } = useWooCommerce();

  // Load data from WordPress when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('🔄 User authenticated, loading cart and wishlist from WordPress...');
      loadCartFromWordPress(user.id);
      loadWishlistFromWordPress(user.id);
    }
  }, [isAuthenticated, user?.id, loadCartFromWordPress, loadWishlistFromWordPress]);

  // Save cart to WordPress when cart changes (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user?.id && cart.length > 0) {
      console.log('🛒 Cart changed, saving to WordPress...');
      saveCartToWordPress(user.id);
    }
  }, [cart, isAuthenticated, user?.id, saveCartToWordPress]);

  // Save wishlist to WordPress when wishlist changes (for authenticated users)
  useEffect(() => {
    if (isAuthenticated && user?.id && wishlist.length > 0) {
      console.log('❤️ Wishlist changed, saving to WordPress...');
      saveWishlistToWordPress(user.id);
    }
  }, [wishlist, isAuthenticated, user?.id, saveWishlistToWordPress]);

  // Manual sync functions
  const syncCartToWordPress = useCallback(() => {
    if (isAuthenticated && user?.id) {
      saveCartToWordPress(user.id);
    }
  }, [isAuthenticated, user?.id, saveCartToWordPress]);

  const syncWishlistToWordPress = useCallback(() => {
    if (isAuthenticated && user?.id) {
      saveWishlistToWordPress(user.id);
    }
  }, [isAuthenticated, user?.id, saveWishlistToWordPress]);

  const loadFromWordPress = useCallback(() => {
    if (isAuthenticated && user?.id) {
      loadCartFromWordPress(user.id);
      loadWishlistFromWordPress(user.id);
    }
  }, [isAuthenticated, user?.id, loadCartFromWordPress, loadWishlistFromWordPress]);

  return {
    isWordPressStorageEnabled: isAuthenticated && !!user?.id,
    syncCartToWordPress,
    syncWishlistToWordPress,
    loadFromWordPress
  };
}


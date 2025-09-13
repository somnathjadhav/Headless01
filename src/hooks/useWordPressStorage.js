import { useEffect, useCallback, useRef } from 'react';
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

  // Refs to track if we're currently loading from WordPress to prevent save loops
  const isLoadingFromWordPress = useRef(false);
  const lastCartLength = useRef(0);
  const lastWishlistLength = useRef(0);

  // Load data from WordPress when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('🔄 User authenticated, loading cart and wishlist from WordPress...');
      isLoadingFromWordPress.current = true;
      loadCartFromWordPress(user.id);
      loadWishlistFromWordPress(user.id);
      // Reset the flag after a short delay to allow cart to update
      setTimeout(() => {
        isLoadingFromWordPress.current = false;
      }, 1000);
    }
  }, [isAuthenticated, user?.id]); // Removed function dependencies to prevent circular updates

  // Save cart to WordPress when cart changes (for authenticated users)
  useEffect(() => {
    // Only save if:
    // 1. User is authenticated
    // 2. Cart has items
    // 3. We're not currently loading from WordPress (to prevent loops)
    // 4. Cart length actually changed (to prevent unnecessary saves)
    if (isAuthenticated && user?.id && cart.length > 0 && !isLoadingFromWordPress.current && cart.length !== lastCartLength.current) {
      console.log('🛒 Cart changed, saving to WordPress...');
      lastCartLength.current = cart.length;
      saveCartToWordPress(user.id);
    }
  }, [cart, isAuthenticated, user?.id, saveCartToWordPress]);

  // Save wishlist to WordPress when wishlist changes (for authenticated users)
  useEffect(() => {
    // Only save if:
    // 1. User is authenticated
    // 2. Wishlist has items
    // 3. We're not currently loading from WordPress (to prevent loops)
    // 4. Wishlist length actually changed (to prevent unnecessary saves)
    if (isAuthenticated && user?.id && wishlist.length > 0 && !isLoadingFromWordPress.current && wishlist.length !== lastWishlistLength.current) {
      console.log('❤️ Wishlist changed, saving to WordPress...');
      lastWishlistLength.current = wishlist.length;
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


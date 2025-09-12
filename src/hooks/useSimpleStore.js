import { useState, useCallback, useMemo } from 'react';

/**
 * Simple, Secure State Management
 * Performance optimized with useCallback and useMemo
 */

export function useSimpleStore() {
  // Core state
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Performance: Memoized cart calculations
  const cartStats = useMemo(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { total, count };
  }, [cart]);

  // Security: Input validation
  const validateProduct = useCallback((product) => {
    if (!product || typeof product !== 'object') return false;
    if (!product.id || !product.name || !product.price) return false;
    if (typeof product.price !== 'string' && typeof product.price !== 'number') return false;
    return true;
  }, []);

  // Performance: Optimized cart operations
  const addToCart = useCallback((product, quantity = 1) => {
    if (!validateProduct(product)) {
      console.error('Invalid product data');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update existing item
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevCart, { ...product, quantity }];
      }
    });
  }, [validateProduct]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateCartItem = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Performance: Memoized actions object
  const actions = useMemo(() => ({
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setProducts,
    setLoading,
    setError
  }), [addToCart, removeFromCart, updateCartItem, clearCart]);

  return {
    // State
    products,
    cart,
    loading,
    error,
    cartStats,
    
    // Actions
    ...actions
  };
}

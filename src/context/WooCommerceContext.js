import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { wooCommerceUtils } from '../lib/woocommerce';

/**
 * WooCommerce Context State
 */
const initialState = {
  // Products
  products: [],
  currentProduct: null,
  categories: [],
  
  // Cart
  cart: [],
  cartTotal: 0,
  cartCount: 0,
  
  // Cart Backup (for Buy Now functionality)
  cartBackup: null,
  
  // Wishlist
  wishlist: [],
  
  // UI State
  loading: false,
  error: null,
  isCartDropdownOpen: false,
  
  // Coupons
  appliedCoupon: null,
  
  // Search and Filters
  searchTerm: '',
  currentCategory: null,
  sortBy: 'date',
  sortOrder: 'desc',
  filterType: null, // 'new', 'popular', 'trending', 'featured', 'on_sale'
  
  // Pagination
  currentPage: 1,
  totalPages: 0,
  totalProducts: 0
};

/**
 * WooCommerce Action Types
 */
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  SET_CATEGORIES: 'SET_CATEGORIES',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  BACKUP_CART: 'BACKUP_CART',
  RESTORE_CART: 'RESTORE_CART',
  CLEAR_CART_BACKUP: 'CLEAR_CART_BACKUP',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_CURRENT_CATEGORY: 'SET_CURRENT_CATEGORY',
  SET_SORT_OPTIONS: 'SET_SORT_OPTIONS',
  SET_FILTER_TYPE: 'SET_FILTER_TYPE',
  SET_PAGINATION: 'SET_PAGINATION',
  LOAD_CART_FROM_STORAGE: 'LOAD_CART_FROM_STORAGE',
  SET_CART_FROM_WORDPRESS: 'SET_CART_FROM_WORDPRESS',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  LOAD_WISHLIST_FROM_STORAGE: 'LOAD_WISHLIST_FROM_STORAGE',
  SET_WISHLIST_FROM_WORDPRESS: 'SET_WISHLIST_FROM_WORDPRESS',
  SET_CART_DROPDOWN_OPEN: 'SET_CART_DROPDOWN_OPEN',
  APPLY_COUPON: 'APPLY_COUPON',
  REMOVE_COUPON: 'REMOVE_COUPON'
};

/**
 * WooCommerce Reducer
 */
function wooCommerceReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case actionTypes.SET_PRODUCTS: {
      console.log('🔍 SET_PRODUCTS reducer called with payload:', action.payload);
      const newState = { 
        ...state, 
        products: action.payload.products,
        totalPages: action.payload.totalPages,
        totalProducts: action.payload.total,
        loading: false,
        error: null
      };
      console.log('🔍 New state after SET_PRODUCTS:', { products: newState.products?.length || 0, totalPages: newState.totalPages, totalProducts: newState.totalProducts });
      return newState;
    }
      
    case actionTypes.SET_CURRENT_PRODUCT:
      return { ...state, currentProduct: action.payload };
      
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload.categories };
      
    case actionTypes.ADD_TO_CART: {
      console.log('🛒 ADD_TO_CART called with payload:', action.payload);
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      let newCart;
      
      if (existingItem) {
        newCart = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        newCart = [...state.cart, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
      
      const cartTotal = newCart.reduce((total, item) => {
        const price = parseFloat(item.price || item.regular_price || 0);
        return total + (price * item.quantity);
      }, 0);
      
      const cartCount = newCart.reduce((count, item) => count + item.quantity, 0);
      
      console.log('🛒 New cart state:', { 
        newCart: newCart.length, 
        cartTotal, 
        cartCount,
        cartData: newCart 
      });
      
      return { 
        ...state, 
        cart: newCart, 
        cartTotal, 
        cartCount 
      };
    }
      
    case actionTypes.REMOVE_FROM_CART: {
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      const newTotal = filteredCart.reduce((total, item) => {
        const price = parseFloat(item.price || item.regular_price || 0);
        return total + (price * item.quantity);
      }, 0);
      const newCount = filteredCart.reduce((count, item) => count + item.quantity, 0);
      
      return { 
        ...state, 
        cart: filteredCart, 
        cartTotal: newTotal, 
        cartCount: newCount 
      };
    }
      
    case actionTypes.UPDATE_CART_ITEM: {
      const updatedCart = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const updatedTotal = updatedCart.reduce((total, item) => {
        const price = parseFloat(item.price || item.regular_price || 0);
        return total + (price * item.quantity);
      }, 0);
      const updatedCount = updatedCart.reduce((count, item) => count + item.quantity, 0);
      
      return { 
        ...state, 
        cart: updatedCart, 
        cartTotal: updatedTotal, 
        cartCount: updatedCount 
      };
    }
      
    case actionTypes.CLEAR_CART:
      return { ...state, cart: [], cartTotal: 0, cartCount: 0 };
      
    case actionTypes.BACKUP_CART:
      return { 
        ...state, 
        cartBackup: {
          cart: [...state.cart],
          cartTotal: state.cartTotal,
          cartCount: state.cartCount
        }
      };
      
    case actionTypes.RESTORE_CART:
      if (state.cartBackup) {
        const restoredCart = state.cartBackup.cart;
        const restoredTotal = state.cartBackup.cartTotal;
        const restoredCount = state.cartBackup.cartCount;
        
        return { 
          ...state, 
          cart: restoredCart,
          cartTotal: restoredTotal,
          cartCount: restoredCount,
          cartBackup: null // Clear backup after restore
        };
      }
      return state;
      
    case actionTypes.CLEAR_CART_BACKUP:
      return { ...state, cartBackup: null };
      
    case actionTypes.ADD_TO_WISHLIST: {
      const existingItem = state.wishlist.find(item => item.id === action.payload.id);
      if (existingItem) {
        return state; // Already in wishlist
      }
      const newWishlist = [...state.wishlist, action.payload];
      return { ...state, wishlist: newWishlist };
    }
      
    case actionTypes.REMOVE_FROM_WISHLIST: {
      const newWishlist = state.wishlist.filter(item => item.id !== action.payload);
      return { ...state, wishlist: newWishlist };
    }
      
    case actionTypes.LOAD_WISHLIST_FROM_STORAGE: {
      // No longer loading from localStorage - data comes from WordPress
      return state;
    }
      
    case actionTypes.SET_WISHLIST_FROM_WORDPRESS: {
      console.log('❤️ Setting wishlist from WordPress:', { 
        wishlist: action.payload.length,
        wishlistData: action.payload 
      });
      
      return { ...state, wishlist: action.payload };
    }

    case actionTypes.SET_CART_DROPDOWN_OPEN:
      return { ...state, isCartDropdownOpen: action.payload };
      
    case actionTypes.APPLY_COUPON:
      return { ...state, appliedCoupon: action.payload };
      
    case actionTypes.REMOVE_COUPON:
      return { ...state, appliedCoupon: null };
      
    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload, currentPage: 1 };
      
    case actionTypes.SET_PAGINATION:
      return { ...state, currentPage: action.payload };
      
    case actionTypes.SET_CURRENT_CATEGORY:
      return { ...state, currentCategory: action.payload, currentPage: 1 };
      
    case actionTypes.SET_SORT_OPTIONS:
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
      
    case actionTypes.SET_FILTER_TYPE:
      return { ...state, filterType: action.payload, currentPage: 1 };
      
    case actionTypes.LOAD_CART_FROM_STORAGE: {
      // No longer loading from localStorage - data comes from WordPress
      return state;
    }
      
    case actionTypes.SET_CART_FROM_WORDPRESS: {
      console.log('🛒 Setting cart from WordPress:', { 
        cart: action.payload.cart.length, 
        cartTotal: action.payload.cartTotal, 
        cartCount: action.payload.cartCount,
        cartData: action.payload.cart 
      });
      
      return { 
        ...state, 
        cart: action.payload.cart, 
        cartTotal: action.payload.cartTotal, 
        cartCount: action.payload.cartCount 
      };
    }
      
    default:
      return state;
  }
}

/**
 * WooCommerce Context
 */
const WooCommerceContext = createContext();

/**
 * WooCommerce Provider Component
 */
export function WooCommerceProvider({ children }) {
  const [state, dispatch] = useReducer(wooCommerceReducer, initialState);

  // No longer loading from localStorage - all data comes from WordPress backend
  useEffect(() => {
    // Cart and wishlist data will be loaded from WordPress when user authenticates
    // or when the WordPress storage hook initializes
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Fetch products with current filters
   */
  const fetchProducts = useCallback(async (page = 1) => {
    console.log('🔍 fetchProducts called with page:', page);
    console.log('🔍 Current state:', { 
      currentCategory: state.currentCategory, 
      searchTerm: state.searchTerm, 
      sortBy: state.sortBy, 
      sortOrder: state.sortOrder,
      filterType: state.filterType
    });
    console.log('🔍 About to make API call to /api/products');
    
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      const params = {
        per_page: 12,
        page,
        category: state.currentCategory ? state.currentCategory.id : '',
        search: state.searchTerm || '',
        orderby: state.sortBy || 'date',
        order: state.sortOrder || 'desc'
      };

      // Handle filter type
      if (state.filterType) {
        switch (state.filterType) {
          case 'new':
            params.orderby = 'date';
            params.order = 'desc';
            break;
          case 'popular':
            params.orderby = 'popularity';
            params.order = 'desc';
            break;
          case 'trending':
            params.orderby = 'popularity';
            params.order = 'desc';
            break;
          case 'featured':
            params.featured = 'true';
            break;
          case 'on_sale':
            params.on_sale = 'true';
            break;
        }
      }
      
      console.log('🔍 API params:', params);
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // Call our API route instead of WooCommerce directly
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('🔍 API response:', { productsCount: result.products?.length || 0, totalPages: result.totalPages, total: result.total });
      
      dispatch({ type: actionTypes.SET_PRODUCTS, payload: result });
      dispatch({ type: actionTypes.SET_PAGINATION, payload: page });
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  }, [dispatch]);

  /**
   * Fetch products with specific category
   */
  const fetchProductsWithCategory = useCallback(async (page = 1, category = null) => {
    console.log('🔍 fetchProductsWithCategory called with page:', page, 'category:', category);
    
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      const params = {
        per_page: 12,
        page,
        category: category ? category.id : '',
        search: state.searchTerm || '',
        orderby: state.sortBy || 'date',
        order: state.sortOrder || 'desc'
      };

      // Handle filter type
      if (state.filterType) {
        switch (state.filterType) {
          case 'new':
            params.orderby = 'date';
            params.order = 'desc';
            break;
          case 'popular':
            params.orderby = 'popularity';
            params.order = 'desc';
            break;
          case 'trending':
            params.orderby = 'popularity';
            params.order = 'desc';
            break;
          case 'featured':
            params.featured = 'true';
            break;
          case 'on_sale':
            params.on_sale = 'true';
            break;
        }
      }
      
      console.log('🔍 API params:', params);
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // Call our API route instead of WooCommerce directly
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      console.log('🔍 API response:', { productsCount: result.products?.length || 0, totalPages: result.totalPages, total: result.total });
      
      dispatch({ type: actionTypes.SET_PRODUCTS, payload: result });
      dispatch({ type: actionTypes.SET_PAGINATION, payload: page });
    } catch (error) {
      console.error('Error in fetchProductsWithCategory:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  }, [dispatch, state.searchTerm, state.sortBy, state.sortOrder, state.filterType]);

  /**
   * Fetch categories
   */
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      dispatch({ type: actionTypes.SET_CATEGORIES, payload: result });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [dispatch]);

  /**
   * Fetch single product
   */
  const fetchProduct = useCallback(async (productId) => {
    console.log('🔍 fetchProduct called with:', productId);
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.SET_ERROR, payload: null });
      console.log('🔍 Making API request to:', `/api/products/${productId}`);
      const response = await fetch(`/api/products/${productId}`);
      console.log('🔍 API response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const product = await response.json();
      console.log('🔍 Product data received:', product.name);
      dispatch({ type: actionTypes.SET_CURRENT_PRODUCT, payload: product });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error('🔍 Error in fetchProduct:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  /**
   * Add item to cart
   */
  const addToCart = useCallback((product, quantity = 1) => {
    dispatch({ type: actionTypes.ADD_TO_CART, payload: { ...product, quantity } });
  }, [dispatch]);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback((productId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: productId });
  }, [dispatch]);

  /**
   * Update cart item quantity
   */
  const updateCartItem = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: actionTypes.UPDATE_CART_ITEM, payload: { id: productId, quantity } });
    }
  }, [dispatch, removeFromCart]);

  /**
   * Clear cart
   */
  const clearCart = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_CART });
  }, [dispatch]);

  /**
   * Backup current cart (for Buy Now functionality)
   */
  const backupCart = useCallback(() => {
    dispatch({ type: actionTypes.BACKUP_CART });
  }, [dispatch]);

  /**
   * Restore backed up cart (after order completion)
   */
  const restoreCart = useCallback(() => {
    dispatch({ type: actionTypes.RESTORE_CART });
  }, [dispatch]);

  /**
   * Clear cart backup (after successful order)
   */
  const clearCartBackup = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_CART_BACKUP });
  }, [dispatch]);

  /**
   * Add item to wishlist
   */
  const addToWishlist = useCallback((product) => {
    dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: product });
  }, [dispatch]);

  /**
   * Remove item from wishlist
   */
  const removeFromWishlist = useCallback((productId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_WISHLIST, payload: productId });
  }, [dispatch]);

  /**
   * Set search term
   */
  const setSearchTerm = useCallback((term) => {
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: term });
  }, [dispatch]);

  /**
   * Set current category
   */
  const setCurrentCategory = useCallback((category) => {
    dispatch({ type: actionTypes.SET_CURRENT_CATEGORY, payload: category });
  }, [dispatch]);

  /**
   * Set sort options
   */
  const setSortOptions = useCallback((sortBy, sortOrder) => {
    dispatch({ type: actionTypes.SET_SORT_OPTIONS, payload: { sortBy, sortOrder } });
  }, [dispatch]);

  /**
   * Set filter type
   */
  const setFilterType = useCallback((filterType) => {
    dispatch({ type: actionTypes.SET_FILTER_TYPE, payload: filterType });
  }, [dispatch]);

  /**
   * Search products
   */
  const searchProducts = useCallback(async (term) => {
    setSearchTerm(term);
    await fetchProducts(1);
  }, [fetchProducts, setSearchTerm]);

  /**
   * Filter by category
   */
  const filterByCategory = useCallback(async (category) => {
    dispatch({ type: actionTypes.SET_CURRENT_CATEGORY, payload: category });
    // Trigger a new fetch with the new category
    setTimeout(() => {
      fetchProductsWithCategory(1, category);
    }, 0);
  }, [dispatch]);

  /**
   * Set cart dropdown open state
   */
  const setIsCartDropdownOpen = useCallback((isOpen) => {
    dispatch({ type: actionTypes.SET_CART_DROPDOWN_OPEN, payload: isOpen });
  }, [dispatch]);

  /**
   * Apply coupon to cart
   */
  const applyCoupon = useCallback((coupon) => {
    dispatch({ type: actionTypes.APPLY_COUPON, payload: coupon });
  }, [dispatch]);

  /**
   * Remove coupon from cart
   */
  const removeCoupon = useCallback(() => {
    dispatch({ type: actionTypes.REMOVE_COUPON });
  }, [dispatch]);

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = useCallback((productId) => {
    return state.wishlist.some(item => item.id === productId);
  }, [state.wishlist]);

  /**
   * Save cart to WordPress (for authenticated users)
   */
  const saveCartToWordPress = useCallback(async (userId) => {
    if (!userId || state.cart.length === 0) return;
    
    try {
      const response = await fetch('/api/cart/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          cartData: state.cart
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Cart saved to WordPress successfully');
      } else {
        console.error('❌ Failed to save cart to WordPress:', result.message);
      }
    } catch (error) {
      console.error('❌ Error saving cart to WordPress:', error);
    }
  }, [state.cart]);

  /**
   * Load cart from WordPress (for authenticated users)
   */
  const loadCartFromWordPress = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/cart/load?userId=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data.cart.length > 0) {
        console.log('✅ Cart loaded from WordPress:', result.data.cart.length, 'items');
        // Replace the entire cart with WordPress data instead of adding to existing cart
        const wpCart = result.data.cart;
        const wpTotal = wpCart.reduce((total, item) => {
          const price = parseFloat(item.price || item.regular_price || 0);
          return total + (price * item.quantity);
        }, 0);
        const wpCount = wpCart.reduce((count, item) => count + item.quantity, 0);
        
        // Update state with WordPress cart data
        dispatch({ 
          type: actionTypes.SET_CART_FROM_WORDPRESS, 
          payload: { cart: wpCart, cartTotal: wpTotal, cartCount: wpCount }
        });
      } else {
        // No cart data in WordPress - start with empty cart
        console.log('📦 No WordPress cart found, starting with empty cart');
        dispatch({ 
          type: actionTypes.SET_CART_FROM_WORDPRESS, 
          payload: { cart: [], cartTotal: 0, cartCount: 0 }
        });
      }
    } catch (error) {
      console.error('❌ Error loading cart from WordPress:', error);
    }
  }, [dispatch]);

  /**
   * Save wishlist to WordPress (for authenticated users)
   */
  const saveWishlistToWordPress = useCallback(async (userId) => {
    if (!userId || state.wishlist.length === 0) return;
    
    try {
      const response = await fetch('/api/wishlist/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          wishlistData: state.wishlist
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Wishlist saved to WordPress successfully');
      } else {
        console.error('❌ Failed to save wishlist to WordPress:', result.message);
      }
    } catch (error) {
      console.error('❌ Error saving wishlist to WordPress:', error);
    }
  }, [state.wishlist]);

  /**
   * Load wishlist from WordPress (for authenticated users)
   */
  const loadWishlistFromWordPress = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/wishlist/load?userId=${userId}`);
      const result = await response.json();
      
      if (result.success && result.data.wishlist.length > 0) {
        console.log('✅ Wishlist loaded from WordPress:', result.data.wishlist.length, 'items');
        // Replace the entire wishlist with WordPress data instead of adding to existing wishlist
        const wpWishlist = result.data.wishlist;
        
        // Update state with WordPress wishlist data
        dispatch({ 
          type: actionTypes.SET_WISHLIST_FROM_WORDPRESS, 
          payload: wpWishlist
        });
      } else {
        // No wishlist data in WordPress - start with empty wishlist
        console.log('❤️ No WordPress wishlist found, starting with empty wishlist');
        dispatch({ 
          type: actionTypes.SET_WISHLIST_FROM_WORDPRESS, 
          payload: []
        });
      }
    } catch (error) {
      console.error('❌ Error loading wishlist from WordPress:', error);
    }
  }, [dispatch]);

  const value = {
    ...state,
    fetchProducts,
    fetchProductsWithCategory,
    fetchProduct,
    fetchCategories,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    backupCart,
    restoreCart,
    clearCartBackup,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    setSearchTerm,
    setCurrentCategory,
    setSortOptions,
    setFilterType,
    searchProducts,
    filterByCategory,
    setIsCartDropdownOpen,
    applyCoupon,
    removeCoupon,
    saveCartToWordPress,
    loadCartFromWordPress,
    saveWishlistToWordPress,
    loadWishlistFromWordPress,
    wooCommerceUtils
  };

  return (
    <WooCommerceContext.Provider value={value}>
      {children}
    </WooCommerceContext.Provider>
  );
}

/**
 * Hook to use WooCommerce context
 */
export function useWooCommerce() {
  const context = useContext(WooCommerceContext);
  if (!context) {
    throw new Error('useWooCommerce must be used within a WooCommerceProvider');
  }
  return context;
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function useAddresses() {
  const { isAuthenticated, user, isInitializing } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedUserIdRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Load addresses from localStorage on mount
  useEffect(() => {
    const storedAddresses = localStorage.getItem('userAddresses');
    if (storedAddresses) {
      try {
        const parsedAddresses = JSON.parse(storedAddresses);
        setAddresses(parsedAddresses);
        console.log('📦 Loaded addresses from localStorage:', parsedAddresses.length);
      } catch (error) {
        console.error('Error parsing stored addresses:', error);
        localStorage.removeItem('userAddresses');
      }
    }
  }, []);

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (addresses.length > 0) {
      localStorage.setItem('userAddresses', JSON.stringify(addresses));
      console.log('💾 Saved addresses to localStorage:', addresses.length);
    }
  }, [addresses]);

  // Load addresses from server
  const loadAddresses = useCallback(async () => {
    // Don't clear addresses during initialization
    if (isInitializing) {
      console.log('Auth still initializing, skipping address load');
      return;
    }
    
    if (!isAuthenticated || !user?.id) {
      // Only clear addresses if we don't have any in localStorage
      const storedAddresses = localStorage.getItem('userAddresses');
      if (!storedAddresses) {
        console.log('Not authenticated or no user ID, clearing addresses');
        setAddresses([]);
        loadedUserIdRef.current = null;
      } else {
        console.log('Not authenticated but keeping addresses from localStorage');
      }
      return;
    }

    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('Address loading already in progress, skipping...');
      return;
    }

    // Check if we've already loaded addresses for this user
    if (loadedUserIdRef.current === user.id && addresses.length > 0) {
      console.log('Addresses already loaded for user:', user.id);
      return;
    }

    // Always fetch fresh data from server - no localStorage caching
    console.log('Loading addresses for user:', user.id);
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/addresses?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const addresses = data.addresses || [];
        console.log('Setting addresses:', addresses);
        setAddresses(addresses);
        loadedUserIdRef.current = user.id;
      } else {
        throw new Error(data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setError(error.message);
      showError(`Failed to load addresses: ${error.message}`);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, user?.id, isInitializing, showSuccess, showError]);

  // Load addresses when user changes
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Add new address
  const addAddress = useCallback(async (addressData) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...addressData
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedAddresses = [...addresses, data.address];
        setAddresses(updatedAddresses);
        showSuccess('Address added successfully!');
        return data.address;
      } else {
        throw new Error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setError(error.message);
      showError(`Failed to add address: ${error.message}`);
      // Don't re-throw the error to prevent unhandled runtime errors
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Update existing address
  const updateAddress = useCallback(async (addressId, addressData) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...addressData
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedAddresses = addresses.map(addr => 
          addr.id === addressId ? { ...addr, ...data.address } : addr
        );
        setAddresses(updatedAddresses);
        showSuccess('Address updated successfully!');
        return data.address;
      } else {
        throw new Error(data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      setError(error.message);
      showError(`Failed to update address: ${error.message}`);
      // Don't re-throw the error to prevent unhandled runtime errors
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Delete address
  const deleteAddress = useCallback(async (addressId) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        setAddresses(updatedAddresses);
        showSuccess('Address deleted successfully!');
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError(error.message);
      showError(`Failed to delete address: ${error.message}`);
      // Don't re-throw the error to prevent unhandled runtime errors
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Set default address
  const setDefaultAddress = useCallback(async (addressId, type = 'billing') => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          type
        })
      });

      const data = await response.json();

      if (data.success) {
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          is_default_billing: type === 'billing' ? addr.id === addressId : addr.is_default_billing,
          is_default_shipping: type === 'shipping' ? addr.id === addressId : addr.is_default_shipping
        }));
        setAddresses(updatedAddresses);
        showSuccess(`Default ${type} address updated successfully!`);
        return true;
      } else {
        throw new Error(data.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setError(error.message);
      showError(`Failed to set default ${type} address: ${error.message}`);
      // Don't re-throw the error to prevent unhandled runtime errors
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Sync addresses to WordPress (for authenticated users)
  const syncAddressesToWordPress = useCallback(async () => {
    if (!isAuthenticated || !user?.id || addresses.length === 0) return;

    try {
      const response = await fetch(`/api/user/addresses/sync?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          userId: user.id,
          addresses
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Addresses synced to WordPress successfully');
        showSuccess('Addresses synced to backend successfully!');
      } else {
        console.error('❌ Failed to sync addresses to WordPress:', data.message);
        showError(`Failed to sync addresses: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error syncing addresses to WordPress:', error);
      showError(`Failed to sync addresses: ${error.message}`);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Clear addresses and localStorage
  const clearAddresses = useCallback(() => {
    setAddresses([]);
    localStorage.removeItem('userAddresses');
    loadedUserIdRef.current = null;
    console.log('🗑️ Cleared addresses and localStorage');
  }, []);

  return {
    addresses,
    loading,
    error,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    syncAddressesToWordPress,
    clearAddresses
  };
}
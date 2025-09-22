import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAddresses() {
  const { isAuthenticated, user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load addresses from server
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated or no user ID, clearing addresses');
      setAddresses([]);
      return;
    }

    // Always fetch fresh data from server - no localStorage caching
    console.log('Loading addresses for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/addresses?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const addresses = data.addresses || [];
        console.log('Setting addresses:', addresses);
        setAddresses(addresses);
      } else {
        throw new Error(data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

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
        return data.address;
      } else {
        throw new Error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setError(error.message);
      // Don't re-throw the error to prevent unhandled runtime errors
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, addresses]);

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
        return data.address;
      } else {
        throw new Error(data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      setError(error.message);
      // Don't re-throw the error to prevent unhandled runtime errors
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, addresses]);

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
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError(error.message);
      // Don't re-throw the error to prevent unhandled runtime errors
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, addresses]);

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
        return true;
      } else {
        throw new Error(data.message || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setError(error.message);
      // Don't re-throw the error to prevent unhandled runtime errors
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, addresses]);

  // Sync addresses to WordPress (for authenticated users)
  const syncAddressesToWordPress = useCallback(async () => {
    if (!isAuthenticated || !user?.id || addresses.length === 0) return;

    try {
      const response = await fetch('/api/user/addresses/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          addresses
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Addresses synced to WordPress successfully');
      } else {
        console.error('❌ Failed to sync addresses to WordPress:', data.message);
      }
    } catch (error) {
      console.error('❌ Error syncing addresses to WordPress:', error);
    }
  }, [isAuthenticated, user?.id, addresses]);

  return {
    addresses,
    loading,
    error,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    syncAddressesToWordPress
  };
}
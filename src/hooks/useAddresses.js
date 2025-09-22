import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const useAddresses = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load addresses from backend
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated or no user ID, clearing addresses');
      setAddresses([]);
      return;
    }

    // Check if we have recent data in localStorage to avoid unnecessary API calls
    const lastFetchKey = `userAddresses_lastFetch_${user.id}`;
    const lastFetch = localStorage.getItem(lastFetchKey);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (lastFetch && (now - parseInt(lastFetch)) < fiveMinutes) {
      console.log('Using cached addresses (less than 5 minutes old)');
      const savedAddresses = localStorage.getItem(`userAddresses_${user.id}`);
      if (savedAddresses) {
        try {
          const parsedAddresses = JSON.parse(savedAddresses);
          setAddresses(parsedAddresses);
          return;
        } catch (parseError) {
          console.error('Error parsing cached addresses:', parseError);
        }
      }
    }

    // Clear old localStorage data for other users and generic key
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('userAddresses_') && key !== `userAddresses_${user.id}`) {
        localStorage.removeItem(key);
        console.log('Cleared old address data for key:', key);
      }
    });
    
    // Also clear the old generic key if it exists
    if (localStorage.getItem('userAddresses')) {
      localStorage.removeItem('userAddresses');
      console.log('Cleared old generic userAddresses key');
    }

    console.log('Loading addresses for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/addresses?userId=${user.id}`, {
        headers: {
          'x-user-id': user.id,
        }
      });

      const data = await response.json();
      console.log('Address API response:', data);

      if (data.success) {
        const addresses = data.addresses || [];
        console.log('Setting addresses:', addresses);
        setAddresses(addresses);
        
        // Update localStorage for caching
        if (addresses.length > 0) {
          localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(addresses));
          localStorage.setItem(`userAddresses_lastFetch_${user.id}`, Date.now().toString());
        }
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

  // Add new address
  const addAddress = useCallback(async (addressData) => {
    if (!isAuthenticated || !user?.id) {
      showError('Please sign in to manage addresses');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (data.success) {
        const newAddress = data.address;
        setAddresses(prev => {
          const updatedAddresses = [...prev, newAddress];
          localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));
          // Clear the cache timestamp so next load will fetch fresh data
          localStorage.removeItem(`userAddresses_lastFetch_${user.id}`);
          return updatedAddresses;
        });
        
        showSuccess('Address added successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setError(error.message);
      showError('Failed to add address. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);


  // Update address
  const updateAddress = useCallback(async (addressId, addressData) => {
    if (!isAuthenticated || !user?.id) {
      showError('Please sign in to manage addresses');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          id: addressId,
          ...addressData
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedAddress = data.address;
        setAddresses(prev => {
          const updatedAddresses = prev.map(addr => 
            addr.id === addressId ? updatedAddress : addr
          );
          localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));
          return updatedAddresses;
        });
        
        showSuccess('Address updated successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      setError(error.message);
      showError('Failed to update address. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Delete address
  const deleteAddress = useCallback(async (addressId, addressType) => {
    if (!isAuthenticated || !user?.id) {
      showError('Please sign in to manage addresses');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          id: addressId,
          type: addressType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(prev => {
          const updatedAddresses = prev.filter(addr => addr.id !== addressId);
          if (updatedAddresses.length === 0) {
            localStorage.removeItem(`userAddresses_${user.id}`);
          } else {
            localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));
          }
          return updatedAddresses;
        });
        
        showSuccess('Address deleted successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError(error.message);
      showError('Failed to delete address. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Set default address
  const setDefaultAddress = useCallback(async (addressId) => {
    if (!isAuthenticated || !user?.id) {
      showError('Please sign in to manage addresses');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Update addresses to set the selected one as default
      setAddresses(prev => {
        const updatedAddresses = prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }));
        localStorage.setItem(`userAddresses_${user.id}`, JSON.stringify(updatedAddresses));
        return updatedAddresses;
      });

      // Try to sync with backend
      const address = addresses.find(addr => addr.id === addressId);
      if (address) {
        await updateAddress(addressId, address);
      }
      
      showSuccess('Default address updated successfully');
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      setError(error.message);
      showError('Failed to update default address. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, addresses, updateAddress, showSuccess, showError]);

  // Load addresses when user changes
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Manual sync function for WooCommerce integration
  const syncAddressesToWordPress = useCallback(async () => {
    if (!isAuthenticated || !user?.id || addresses.length === 0) return;
    
    try {
      console.log('🏠 Syncing addresses to WooCommerce...');
      
      // Save each address to WooCommerce
      for (const address of addresses) {
        const response = await fetch('/api/user/addresses', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify(address),
        });
        
        if (!response.ok) {
          console.error('Failed to sync address to WooCommerce:', address.id);
        }
      }
      
      console.log('✅ Addresses synced to WooCommerce');
    } catch (error) {
      console.error('Error syncing addresses to WooCommerce:', error);
    }
  }, [isAuthenticated, user?.id, addresses]);

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loadAddresses,
    syncAddressesToWordPress
  };
};

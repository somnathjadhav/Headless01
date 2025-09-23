import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function useAddresses() {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadedUserIdRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Load addresses from server
  const loadAddresses = useCallback(async () => {
    
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated or no user ID, clearing addresses');
      setAddresses([]);
      loadedUserIdRef.current = null;
      return;
    }

    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('Address loading already in progress, skipping...');
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
          loadedUserIdRef.current = user.id;
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

    // Check if we've already loaded addresses for this user
    if (loadedUserIdRef.current === user.id && addresses.length > 0) {
      console.log('Addresses already loaded for user:', user.id);
      return;
    }

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
      showError(`Failed to load addresses: ${error.message}`);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

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
      console.log('🔄 Adding address:', addressData);
      
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();
      console.log('🔄 Address add response:', data);

      if (data.success) {
        const updatedAddresses = [...addresses, data.address];
        setAddresses(updatedAddresses);
        
        // Clear cache to force fresh data on next load
        const lastFetchKey = `userAddresses_lastFetch_${user.id}`;
        localStorage.removeItem(lastFetchKey);
        
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
      console.log('🔄 Updating address:', { addressId, addressData });
      
      // Use the correct API endpoint - PUT to /api/user/addresses with address data
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          id: addressId,
          ...addressData
        })
      });

      const data = await response.json();
      console.log('🔄 Address update response:', data);

      if (data.success) {
        // Update the local state with the updated address
        const updatedAddresses = addresses.map(addr => 
          addr.id === addressId ? { ...addr, ...data.address } : addr
        );
        setAddresses(updatedAddresses);
        
        // Clear cache to force fresh data on next load
        const lastFetchKey = `userAddresses_lastFetch_${user.id}`;
        localStorage.removeItem(lastFetchKey);
        
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
  }, [isAuthenticated, user?.id, addresses, showSuccess, showError]);

  // Delete address
  const deleteAddress = useCallback(async (addressId) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Deleting address:', addressId);
      
      // Find the address to get its type
      const addressToDelete = addresses.find(addr => addr.id === addressId);
      if (!addressToDelete) {
        throw new Error('Address not found');
      }
      
      // Use the correct API endpoint - DELETE to /api/user/addresses with address data
      const response = await fetch('/api/user/addresses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          id: addressId,
          type: addressToDelete.type
        })
      });

      const data = await response.json();
      console.log('🔄 Address delete response:', data);

      if (data.success) {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        setAddresses(updatedAddresses);
        
        // Clear cache to force fresh data on next load
        const lastFetchKey = `userAddresses_lastFetch_${user.id}`;
        localStorage.removeItem(lastFetchKey);
        
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
  }, [isAuthenticated, user?.id, addresses, showSuccess, showError]);

  // Set default address
  const setDefaultAddress = useCallback(async (addressId, type = 'billing') => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Setting default address:', { addressId, type });
      
      // Find the address to update
      const addressToUpdate = addresses.find(addr => addr.id === addressId);
      if (!addressToUpdate) {
        throw new Error('Address not found');
      }
      
      // Update the address with the default flag
      const updatedAddressData = {
        ...addressToUpdate,
        isDefault: true
      };
      
      // Use the updateAddress function to set as default
      const result = await updateAddress(addressId, updatedAddressData);
      
      if (result) {
        // Update local state to reflect the default status
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId && addr.type === type
        }));
        setAddresses(updatedAddresses);
        
        showSuccess(`Default ${type} address updated successfully!`);
        return true;
      } else {
        throw new Error('Failed to set default address');
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
  }, [isAuthenticated, user?.id, addresses, updateAddress, showSuccess, showError]);

  // Sync addresses to WordPress (for authenticated users)
  const syncAddressesToWordPress = useCallback(async () => {
    if (!isAuthenticated || !user?.id || addresses.length === 0) return;
    
    try {
      console.log('🏠 Syncing addresses to WordPress...');
      
      // Save each address to WordPress
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
          console.error('Failed to sync address to WordPress:', address.id);
        }
      }
      
      console.log('✅ Addresses synced to WordPress');
      showSuccess('Addresses synced to backend successfully!');
    } catch (error) {
      console.error('Error syncing addresses to WordPress:', error);
      showError(`Failed to sync addresses: ${error.message}`);
    }
  }, [isAuthenticated, user?.id, addresses, showSuccess, showError]);

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
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function useProfileSync() {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Sync profile from backend to frontend
  const syncFromBackend = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated or no user ID, skipping sync');
      return null;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Profile synced from backend:', data.profile);
        setLastSyncTime(new Date());
        return data.profile;
      } else {
        throw new Error(data.message || 'Failed to sync profile from backend');
      }
    } catch (error) {
      console.error('❌ Error syncing profile from backend:', error);
      showError('Failed to sync profile from backend');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user?.id, showError]);

  // Sync profile from frontend to backend
  const syncToBackend = useCallback(async (profileData) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setIsSyncing(true);
    try {
      const response = await fetch('/api/user/profile/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ profile: profileData })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Profile synced to backend:', data.profile);
        setLastSyncTime(new Date());
        showSuccess('Profile synced successfully');
        return data.profile;
      } else {
        throw new Error(data.message || 'Failed to sync profile to backend');
      }
    } catch (error) {
      console.error('❌ Error syncing profile to backend:', error);
      showError('Failed to sync profile to backend');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Auto-sync from backend when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('🔄 Auto-syncing profile from backend...');
      syncFromBackend();
    }
  }, [isAuthenticated, user?.id, syncFromBackend]);

  // Sync profile data with proper field mapping
  const syncProfileData = useCallback((frontendData) => {
    return {
      firstName: frontendData.firstName || frontendData.first_name || '',
      lastName: frontendData.lastName || frontendData.last_name || '',
      email: frontendData.email || '',
      phone: frontendData.phone || frontendData.billing?.phone || '',
      company: frontendData.company || frontendData.billing?.company || '',
      address: frontendData.address || frontendData.billing?.address_1 || '',
      city: frontendData.city || frontendData.billing?.city || '',
      state: frontendData.state || frontendData.billing?.state || '',
      zipCode: frontendData.zipCode || frontendData.billing?.postcode || '',
      country: frontendData.country || frontendData.billing?.country || ''
    };
  }, []);

  // Transform backend data to frontend format
  const transformBackendToFrontend = useCallback((backendData) => {
    if (!backendData) return null;

    // Handle name splitting more intelligently
    let firstName = backendData.first_name || '';
    let lastName = backendData.last_name || '';
    
    // If we have a name but no first_name/last_name, try to split it
    if (!firstName && !lastName && backendData.name) {
      const nameParts = backendData.name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // If we still don't have a last name but have a first name, try to extract from name
    if (!lastName && firstName && backendData.name && backendData.name !== firstName) {
      const remainingName = backendData.name.replace(firstName, '').trim();
      if (remainingName) {
        lastName = remainingName;
      }
    }

    return {
      firstName: firstName,
      lastName: lastName,
      email: backendData.email || '',
      phone: backendData.billing?.phone || backendData.shipping?.phone || backendData.phone || '',
      company: backendData.billing?.company || backendData.shipping?.company || backendData.company || '',
      address: backendData.billing?.address_1 || backendData.shipping?.address_1 || '',
      city: backendData.billing?.city || backendData.shipping?.city || '',
      state: backendData.billing?.state || backendData.shipping?.state || '',
      zipCode: backendData.billing?.postcode || backendData.shipping?.postcode || '',
      country: backendData.billing?.country || backendData.shipping?.country || ''
    };
  }, []);

  return {
    isSyncing,
    lastSyncTime,
    syncFromBackend,
    syncToBackend,
    syncProfileData,
    transformBackendToFrontend
  };
}

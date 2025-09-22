import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load profile from server
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated or no user ID, clearing profile');
      setProfile(null);
      return;
    }

    // Always fetch fresh data from server - no localStorage caching
    console.log('Loading profile for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const profileData = data.profile || {};
        console.log('Setting profile:', profileData);
        setProfile(profileData);
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        const updatedProfile = { ...profile, ...data.profile };
        setProfile(updatedProfile);
        return data.profile;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, profile]);

  // Sync profile to WordPress (for authenticated users)
  const syncProfileToWordPress = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !profile) return;

    try {
      const response = await fetch('/api/user/profile/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profile
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Profile synced to WordPress successfully');
      } else {
        console.error('❌ Failed to sync profile to WordPress:', data.message);
      }
    } catch (error) {
      console.error('❌ Error syncing profile to WordPress:', error);
    }
  }, [isAuthenticated, user?.id, profile]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    syncProfileToWordPress
  };
}
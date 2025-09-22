import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const useProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load profile from backend
  const loadProfile = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      console.log('Not authenticated or no user ID, clearing profile');
      setProfile(null);
      return;
    }

    // Check if we have recent data in localStorage to avoid unnecessary API calls
    const lastFetchKey = `userProfile_lastFetch_${user.id}`;
    const lastFetch = localStorage.getItem(lastFetchKey);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (lastFetch && (now - parseInt(lastFetch)) < fiveMinutes) {
      console.log('Using cached profile (less than 5 minutes old)');
      const savedProfile = localStorage.getItem(`userProfile_${user.id}`);
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
          return;
        } catch (parseError) {
          console.error('Error parsing cached profile:', parseError);
        }
      }
    }

    // Clear old localStorage data for other users and generic key
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('userProfile_') && key !== `userProfile_${user.id}`) {
        localStorage.removeItem(key);
        console.log('Cleared old profile data for key:', key);
      }
    });
    
    // Also clear the old generic key if it exists
    if (localStorage.getItem('userProfile')) {
      localStorage.removeItem('userProfile');
      console.log('Cleared old generic userProfile key');
    }

    console.log('Loading profile for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-profile?userId=${user.id}`, {
        headers: {
          'x-user-id': user.id,
        }
      });

      const data = await response.json();
      console.log('Profile API response:', data);

      if (data.success) {
        const profileData = data.profile;
        console.log('Setting profile:', profileData);
        setProfile(profileData);
        
        // Update localStorage for caching
        localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(profileData));
        localStorage.setItem(`userProfile_lastFetch_${user.id}`, Date.now().toString());
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

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    if (!isAuthenticated || !user?.id) {
      showError('Please sign in to update your profile');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-profile-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        const updatedProfile = data.profile;
        setProfile(updatedProfile);
        
        // Update localStorage for caching
        localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(updatedProfile));
        // Clear the cache timestamp so next load will fetch fresh data
        localStorage.removeItem(`userProfile_lastFetch_${user.id}`);
        
        showSuccess('Profile updated successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      showError('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, showSuccess, showError]);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile
  };
};

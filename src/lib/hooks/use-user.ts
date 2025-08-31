import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth';
import { UserService } from '@/lib/user-service';
import type {
  ExtendedUser,
  Profile,
  UpdatePreferencesData,
  UpdateProfileData,
  UserPreferences,
} from '@/types';

// Core user data management
function useUserData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await UserService.getExtendedUser(user.id);
      if (result.success && result.data) {
        setExtendedUser(result.data);
        setProfile(result.data.profile);
        setPreferences(result.data.preferences);
      } else {
        setError(result.error || 'Failed to load user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const clearUserData = useCallback(() => {
    setProfile(null);
    setPreferences(null);
    setExtendedUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      clearUserData();
    }
  }, [user?.id, loadUserData, clearUserData]);

  return {
    profile,
    preferences,
    extendedUser,
    isLoading,
    error,
    loadUserData,
    clearUserData,
    setProfile,
    setPreferences,
    setExtendedUser,
    setError,
  };
}

// Profile management
function useProfileManagement() {
  const { user } = useAuth();
  const { extendedUser, setProfile, setExtendedUser, setError } = useUserData();

  const updateProfile = useCallback(
    async (profileData: UpdateProfileData) => {
      if (!user?.id) return { success: false, error: 'No user ID' };
      setError(null);
      try {
        const result = await UserService.updateProfile(user.id, profileData);
        if (result.success && result.data) {
          setProfile(result.data);
          if (extendedUser) {
            setExtendedUser((prev: ExtendedUser | null) =>
              prev ? { ...prev, profile: result.data! } : null
            );
          }
          return { success: true, data: result.data };
        } else {
          setError(result.error || 'Failed to update profile');
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [user?.id, extendedUser, setProfile, setExtendedUser, setError]
  );

  return { updateProfile };
}

// Preferences management
function usePreferencesManagement() {
  const { user } = useAuth();
  const { extendedUser, setPreferences, setExtendedUser, setError } =
    useUserData();

  const updatePreferences = useCallback(
    async (preferencesData: UpdatePreferencesData) => {
      if (!user?.id) return { success: false, error: 'No user ID' };
      setError(null);
      try {
        const result = await UserService.updatePreferences(
          user.id,
          preferencesData
        );
        if (result.success && result.data) {
          setPreferences(result.data);
          if (extendedUser) {
            setExtendedUser((prev: ExtendedUser | null) =>
              prev ? { ...prev, preferences: result.data! } : null
            );
          }
          return { success: true, data: result.data };
        } else {
          setError(result.error || 'Failed to update preferences');
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [user?.id, extendedUser, setPreferences, setExtendedUser, setError]
  );

  return { updatePreferences };
}

// Main useUser hook
export function useUser() {
  const {
    profile,
    preferences,
    extendedUser,
    isLoading,
    error,
    loadUserData,
    clearUserData,
  } = useUserData();
  const { updateProfile } = useProfileManagement();
  const { updatePreferences } = usePreferencesManagement();

  const refresh = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    profile,
    preferences,
    extendedUser,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    refresh,
    clearUserData,
    isProfileComplete: profile && profile.username && profile.full_name,
    isVerified: profile?.is_verified || false,
    userRole: profile?.role || 'user',
    userStatus: profile?.status || 'pending_verification',
  };
}

// Hook for user preferences only
export function useUserPreferences() {
  const { preferences, updatePreferences, isLoading, error } = useUser();

  return {
    preferences,
    updatePreferences,
    isLoading,
    error,
    theme: preferences?.theme || 'system',
    language: preferences?.language || 'en',
    notificationsEnabled: preferences?.notifications_enabled || true,
    currency: preferences?.currency || 'USD',
  };
}

// Hook for user profile only
export function useUserProfile() {
  const { profile, updateProfile, isLoading, error } = useUser();

  return {
    profile,
    updateProfile,
    isLoading,
    error,
    displayName:
      profile?.full_name || profile?.username || profile?.email || 'User',
    hasAvatar: !!profile?.avatar_url,
    isProfileComplete: profile && profile.username && profile.full_name,
  };
}

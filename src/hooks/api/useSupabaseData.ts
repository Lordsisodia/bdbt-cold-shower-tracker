import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { trackingAPI, profileAPI, offlineAPI, TrackedDay, UserProfile } from '../lib/supabase';

interface SupabaseDataState {
  trackedDays: TrackedDay[];
  profile: UserProfile | null;
  isLoading: boolean;
  isOnline: boolean;
  error: string | null;
}

export const useSupabaseData = (user: User | null) => {
  const [state, setState] = useState<SupabaseDataState>({
    trackedDays: [],
    profile: null,
    isLoading: true,
    isOnline: navigator.onLine,
    error: null
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data when user is available
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Load from localStorage when not authenticated
      loadLocalData();
    }
  }, [user]);

  // Sync offline data when coming back online
  useEffect(() => {
    if (state.isOnline && user) {
      syncOfflineData();
    }
  }, [state.isOnline, user]);

  const loadUserData = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [trackedDays, profile] = await Promise.all([
        trackingAPI.getTrackedDays(user.id),
        profileAPI.getProfile(user.id)
      ]);

      setState(prev => ({
        ...prev,
        trackedDays,
        profile,
        isLoading: false
      }));

      // Cache data locally
      localStorage.setItem('cachedTrackedDays', JSON.stringify(trackedDays));
      if (profile) {
        localStorage.setItem('cachedProfile', JSON.stringify(profile));
      }

    } catch (error) {
      console.error('Failed to load user data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load data',
        isLoading: false
      }));

      // Fall back to cached data
      loadLocalData();
    }
  };

  const loadLocalData = () => {
    const cachedTrackedDays = localStorage.getItem('cachedTrackedDays') || localStorage.getItem('coldShowerTracker');
    const cachedProfile = localStorage.getItem('cachedProfile');

    let trackedDays: TrackedDay[] = [];

    if (cachedTrackedDays) {
      try {
        const parsed = JSON.parse(cachedTrackedDays);
        
        // Handle legacy format
        if (Array.isArray(parsed) && parsed[0] && typeof parsed[0].date === 'string') {
          trackedDays = parsed.map(day => ({
            date: day.date,
            completed: day.completed,
            extra_cold: day.extraCold,
            felt_amazing: day.feltAmazing,
            user_id: user?.id || 'local'
          }));
        } else {
          trackedDays = parsed;
        }
      } catch (error) {
        console.error('Failed to parse cached data:', error);
      }
    }

    let profile: UserProfile | null = null;
    if (cachedProfile) {
      try {
        profile = JSON.parse(cachedProfile);
      } catch (error) {
        console.error('Failed to parse cached profile:', error);
      }
    }

    setState(prev => ({
      ...prev,
      trackedDays,
      profile,
      isLoading: false
    }));
  };

  const syncOfflineData = async () => {
    if (!user) return;

    try {
      await offlineAPI.syncOfflineData(user.id);
      await loadUserData(); // Reload after sync
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const upsertTrackedDay = useCallback(async (day: Omit<TrackedDay, 'user_id'>) => {
    const trackedDay = {
      ...day,
      user_id: user?.id || 'local'
    };

    // Update local state immediately
    setState(prev => {
      const updated = prev.trackedDays.filter(d => d.date !== day.date);
      updated.push(trackedDay);
      return {
        ...prev,
        trackedDays: updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });

    // Update localStorage
    const updatedDays = state.trackedDays.filter(d => d.date !== day.date);
    updatedDays.push(trackedDay);
    localStorage.setItem('cachedTrackedDays', JSON.stringify(updatedDays));

    if (state.isOnline && user) {
      try {
        await trackingAPI.upsertTrackedDay(trackedDay);
      } catch (error) {
        console.error('Failed to sync tracked day:', error);
        // Save for offline sync
        await offlineAPI.saveOfflineData(`tracked_day_${day.date}`, trackedDay);
      }
    } else {
      // Save for offline sync
      await offlineAPI.saveOfflineData(`tracked_day_${day.date}`, trackedDay);
    }
  }, [user, state.isOnline, state.trackedDays]);

  const deleteTrackedDay = useCallback(async (date: string) => {
    // Update local state immediately
    setState(prev => ({
      ...prev,
      trackedDays: prev.trackedDays.filter(d => d.date !== date)
    }));

    // Update localStorage
    const updatedDays = state.trackedDays.filter(d => d.date !== date);
    localStorage.setItem('cachedTrackedDays', JSON.stringify(updatedDays));

    if (state.isOnline && user) {
      try {
        await trackingAPI.deleteTrackedDay(user.id, date);
      } catch (error) {
        console.error('Failed to delete tracked day:', error);
      }
    }
  }, [user, state.isOnline, state.trackedDays]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const updatedProfile = {
      ...state.profile,
      ...updates,
      id: user.id
    } as UserProfile;

    setState(prev => ({
      ...prev,
      profile: updatedProfile
    }));

    localStorage.setItem('cachedProfile', JSON.stringify(updatedProfile));

    if (state.isOnline) {
      try {
        await profileAPI.updateProfile(updatedProfile);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    }
  }, [user, state.profile, state.isOnline]);

  // Utility functions for legacy compatibility
  const toggleDay = useCallback((date: string) => {
    const existingDay = state.trackedDays.find(d => d.date === date);
    
    if (existingDay) {
      upsertTrackedDay({
        ...existingDay,
        completed: !existingDay.completed
      });
    } else {
      upsertTrackedDay({
        date,
        completed: true
      });
    }
  }, [state.trackedDays, upsertTrackedDay]);

  const setDayProperty = useCallback((date: string, property: 'extra_cold' | 'felt_amazing', value: boolean) => {
    const existingDay = state.trackedDays.find(d => d.date === date);
    
    const dayData = existingDay || {
      date,
      completed: false
    };

    upsertTrackedDay({
      ...dayData,
      [property]: value
    });
  }, [state.trackedDays, upsertTrackedDay]);

  return {
    ...state,
    upsertTrackedDay,
    deleteTrackedDay,
    updateProfile,
    toggleDay,
    setDayProperty,
    syncOfflineData,
    reload: loadUserData
  };
};
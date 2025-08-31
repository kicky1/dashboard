import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { dashboardSettingsApi } from '@/api/dashboard-settings';

export function useDashboardSettings() {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setIsActive(nextAppState === 'active');
    };

    // Listen to app focus/blur events
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => subscription?.remove();
  }, []);

  return useQuery({
    queryKey: ['dashboard-settings'],
    queryFn: dashboardSettingsApi.getDashboardSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: isActive ? 30 * 1000 : false, // Only poll when active
    refetchOnWindowFocus: true, // Refetch when user returns to app
  });
}

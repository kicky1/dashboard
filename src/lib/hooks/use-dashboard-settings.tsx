import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { dashboardSettingsApi } from '@/api/dashboard-settings';

export function useDashboardSettings() {
  const [isActive, setIsActive] = useState(true);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const queryClient = useQueryClient();

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

  // Check initial simulation state
  useEffect(() => {
    setIsSimulationRunning(dashboardSettingsApi.isSimulationRunning());
  }, []);

  const startSimulation = useCallback(
    (fastMode: boolean = false) => {
      dashboardSettingsApi.startSimulation(fastMode);
      setIsSimulationRunning(true);

      // Invalidate and refetch settings to show immediate changes
      queryClient.invalidateQueries({ queryKey: ['dashboard-settings'] });

      const modeText = fastMode ? '30 seconds' : '5 minutes';
      console.log(
        `🎬 Simulation started - settings will change every ${modeText}`
      );
    },
    [queryClient]
  );

  const stopSimulation = useCallback(() => {
    dashboardSettingsApi.stopSimulation();
    setIsSimulationRunning(false);

    // Invalidate and refetch settings to show reset values
    queryClient.invalidateQueries({ queryKey: ['dashboard-settings'] });

    console.log('⏹️ Simulation stopped - settings reset to initial values');
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['dashboard-settings'],
    queryFn: dashboardSettingsApi.getDashboardSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: isActive ? 30 * 1000 : false, // Only poll when active
    refetchOnWindowFocus: true, // Refetch when user returns to app
  });

  return {
    ...query,
    isSimulationRunning,
    startSimulation,
    stopSimulation,
  };
}

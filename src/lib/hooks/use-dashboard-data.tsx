import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/api/dashboard';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: dashboardApi.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRecentExpenses(limit: number = 4) {
  return useQuery({
    queryKey: ['recent-expenses', limit],
    queryFn: () => dashboardApi.getRecentExpenses(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

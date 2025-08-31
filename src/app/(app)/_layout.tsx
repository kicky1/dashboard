import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import {
  Expenses as ExpensesIcon,
  Home as HomeIcon,
  Income as IncomeIcon,
  Settings as SettingsIcon,
} from '@/components/ui/icons';
import { translate, useAuth } from '@/lib';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, isLoading]);

  if (!isLoading && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: translate('tabs.dashboard'),
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarButtonTestID: 'dashboard-tab',
        }}
      />

      <Tabs.Screen
        name="expenses"
        options={{
          title: translate('tabs.expenses'),
          headerShown: false,
          tabBarIcon: ({ color }) => <ExpensesIcon color={color} />,
          tabBarButtonTestID: 'expenses-tab',
        }}
      />

      <Tabs.Screen
        name="income"
        options={{
          title: translate('tabs.income'),
          headerShown: false,
          tabBarIcon: ({ color }) => <IncomeIcon color={color} />,
          tabBarButtonTestID: 'income-tab',
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: translate('tabs.settings'),
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

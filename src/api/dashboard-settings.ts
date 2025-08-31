import type { DashboardSettings } from '@/types';

// 🎛️ MOCK DASHBOARD SETTINGS - SIMULATES BACKEND RESPONSE
//
// To test different configurations, simply change the values below:
// - Change `showRecentExpenses: false` to hide recent expenses
// - Change `recentExpensesLimit: 2` to show only 2 recent expenses
// - Change `showUserHeader: false` to hide the user header
// - Change `dashboardTitle: 'My App'` to customize the title
//
// The dashboard will automatically update when you change these values!
const mockDashboardSettings: DashboardSettings = {
  // General settings
  showTotalBalance: true,
  showIncome: true,
  showExpenses: true,

  // Recent items settings
  showRecentExpenses: true,
  showRecentIncome: false,
  recentExpensesLimit: 4,
  recentIncomeLimit: 3,

  // Layout settings
  showUserHeader: true,
  showBalanceCard: true,

  // Additional features
  showCurrencyConverter: true,
  showQuickActions: false,
  showCharts: true,

  // Customization
  dashboardTitle: 'Dashboard',
  welcomeMessage: 'Welcome back!',

  // Feature toggles
  enableNotifications: true,
  enableDarkMode: true,
  enableAnimations: true,
};

export const dashboardSettingsApi = {
  // Simulate getting settings from backend
  async getDashboardSettings(): Promise<DashboardSettings> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate potential backend errors (uncomment to test)
    // if (Math.random() < 0.1) {
    //   throw new Error('Backend connection failed');
    // }

    return mockDashboardSettings;
  },
};

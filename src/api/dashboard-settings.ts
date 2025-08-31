import { translate } from '@/lib/i18n';
import type { DashboardSettings } from '@/types';

// 🎛️ DASHBOARD SETTINGS API WITH I18N SUPPORT
//
// This API provides mock dashboard settings with internationalization support.
// The API automatically uses the current language from the i18n system.
//
// Example usage in a component:
// const settings = await dashboardSettingsApi.getDashboardSettings();
// const title = translate(settings.dashboardTitleKey);
// const welcome = translate(settings.welcomeMessageKey);

// 🎛️ MOCK DASHBOARD SETTINGS - SIMULATES BACKEND RESPONSE
//
// To test different configurations, simply change the values below:
// - Change `showRecentExpenses: false` to hide recent expenses
// - Change `recentExpensesLimit: 2` to show only 2 recent expenses
// - Change `showUserHeader: false` to hide the user header
// - Change `dashboardTitleKey: 'dashboard.title'` to customize the title
//
// The dashboard will automatically update when you change these values!
const initialMockDashboardSettings: DashboardSettings = {
  // General settings
  showTotalBalance: true,
  showIncome: true,
  showExpenses: true,

  // Recent items settings
  showRecentExpenses: true,
  recentExpensesLimit: 4,

  // Layout settings
  showUserHeader: true,
  showBalanceCard: true,

  // Additional features
  showCurrencyConverter: true,
  showQuickActions: false,
  showCharts: true,

  // Customization - using translation keys
  dashboardTitleKey: 'dashboard.title',
  welcomeMessageKey: 'dashboard.welcome_back',

  // Feature toggles
  enableNotifications: true,
  enableDarkMode: true,
  enableAnimations: true,
};

// Current mock settings that can be modified
let currentMockSettings = { ...initialMockDashboardSettings };
let simulationInterval: ReturnType<typeof setInterval> | null = null;
let lastConfigurationIndex = -1; // Track the last configuration used

// Function to generate specific dashboard configurations
function generateRandomChanges(): void {
  // Define 2 specific dashboard configurations (main dashboard always visible)
  const configurations = [
    // Configuration 1: Show charts below main dashboard
    {
      showTotalBalance: true,
      showIncome: true,
      showExpenses: true,
      showRecentExpenses: false,
      showCharts: true,
      showUserHeader: true,
      showBalanceCard: true,
      showCurrencyConverter: true,
      showQuickActions: false,
      dashboardTitleKey: 'dashboard.title',
      welcomeMessageKey: 'dashboard.welcome_back',
    },
    // Configuration 2: Show recent transactions below main dashboard
    {
      showTotalBalance: true,
      showIncome: true,
      showExpenses: true,
      showRecentExpenses: true,
      showCharts: false,
      showUserHeader: true,
      showBalanceCard: true,
      showCurrencyConverter: true,
      showQuickActions: true,
      dashboardTitleKey: 'dashboard.title',
      welcomeMessageKey: 'dashboard.welcome_back',
    },
  ];

  // Choose a different configuration than the last one
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * configurations.length);
  } while (newIndex === lastConfigurationIndex && configurations.length > 1);

  // Update the configuration
  const newConfiguration = configurations[newIndex];
  lastConfigurationIndex = newIndex;

  // Apply the new configuration to current settings
  Object.assign(currentMockSettings, newConfiguration);

  // Keep some settings consistent across all configurations
  currentMockSettings.enableNotifications = true;
  currentMockSettings.enableDarkMode = true;
  currentMockSettings.enableAnimations = true;
  currentMockSettings.recentExpensesLimit = 4;

  const layoutType = newIndex === 0 ? 'Charts' : 'Recent Transactions';
  console.log(
    `🔄 ${translate('settings.simulation.switched_to')} ${newIndex + 1}: Main Dashboard + ${layoutType}`
  );
}

export const dashboardSettingsApi = {
  // Simulate getting settings from backend
  async getDashboardSettings(): Promise<DashboardSettings> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate potential backend errors (uncomment to test)
    // if (Math.random() < 0.1) {
    //   throw new Error('Backend connection failed');
    // }

    return { ...currentMockSettings };
  },

  // Start simulation of dynamic changes
  startSimulation(fastMode: boolean = false): void {
    if (simulationInterval) {
      return; // Already running
    }

    const interval = fastMode ? 30 * 1000 : 5 * 60 * 1000; // 30 seconds or 5 minutes
    const modeText = fastMode ? '30 seconds' : '5 minutes';

    // Run at specified interval
    simulationInterval = setInterval(() => {
      generateRandomChanges();
      console.log(
        `🔄 ${translate('settings.simulation.settings_updated')}:`,
        currentMockSettings
      );
    }, interval);

    console.log(
      `🚀 ${translate('settings.simulation.simulation_started')} ${modeText}`
    );
  },

  // Stop simulation and reset to initial values
  stopSimulation(): void {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
      currentMockSettings = { ...initialMockDashboardSettings };
      lastConfigurationIndex = -1; // Reset the configuration tracker
      console.log(`⏹️ ${translate('settings.simulation.simulation_stopped')}`);
    }
  },

  // Check if simulation is running
  isSimulationRunning(): boolean {
    return simulationInterval !== null;
  },

  // Get current simulation state
  getSimulationState(): {
    isRunning: boolean;
    currentSettings: DashboardSettings;
  } {
    return {
      isRunning: simulationInterval !== null,
      currentSettings: { ...currentMockSettings },
    };
  },
};

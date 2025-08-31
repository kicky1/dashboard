import { Env } from '@env';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  FocusAwareStatusBar,
  ScrollView,
  SimulationToggle,
  View,
} from '@/components/ui';
import { useAuth } from '@/lib';
import { useDashboardSettings } from '@/lib/hooks/use-dashboard-settings';

export default function Settings() {
  const { signOut } = useAuth();
  const { isSimulationRunning, startSimulation, stopSimulation } =
    useDashboardSettings();

  // const handleResetAllData = async () => {
  //   try {
  //     await clearAllData();
  //     // After clearing data, sign out to redirect to login
  //     await signOut();
  //   } catch (error) {
  //     console.error('Error resetting data:', error);
  //   }
  // };

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />

      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-24">
          <ItemsContainer title="settings.general">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <View className="my-8">
            <SimulationToggle
              isRunning={isSimulationRunning}
              onStart={startSimulation}
              onStop={stopSimulation}
            />
          </View>

          <View className="mb-8 mt-auto">
            <ItemsContainer>
              <Item text="settings.logout" onPress={signOut} />
            </ItemsContainer>
          </View>

          {/* <View className="mb-8">
            <ItemsContainer>
              <Item
                text="settings.reset_all_data"
                onPress={handleResetAllData}
              />
            </ItemsContainer>
          </View> */}
        </View>
      </ScrollView>
    </View>
  );
}

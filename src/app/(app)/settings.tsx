import { Env } from '@env';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { translate, useAuth } from '@/lib';

export default function Settings() {
  const { signOut, clearAllData } = useAuth();

  const handleResetAllData = async () => {
    try {
      await clearAllData();
      // After clearing data, sign out to redirect to login
      await signOut();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />

      <ScrollView className="flex-1">
        <View className="flex-1 px-4 pt-16">
          <Text className="text-xl font-bold text-neutral-900 dark:text-white">
            {translate('settings.title')}
          </Text>
          <ItemsContainer title="settings.general">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" onPress={signOut} />
            </ItemsContainer>
          </View>

          <View className="mb-8">
            <ItemsContainer>
              <Item
                text="settings.reset_all_data"
                onPress={handleResetAllData}
              />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

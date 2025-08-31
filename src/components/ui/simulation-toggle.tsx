import * as React from 'react';
import { Text, View } from 'react-native';

import { translate } from '@/lib/i18n';

import { Button } from './button';

type Props = {
  isRunning: boolean;
  onStart: (fastMode?: boolean) => void;
  onStop: () => void;
  disabled?: boolean;
};

export function SimulationToggle({
  isRunning,
  onStart,
  onStop,
  disabled = false,
}: Props) {
  return (
    <View className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {translate('settings.simulation.title')}
          </Text>
          <Text className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {isRunning
              ? translate('settings.simulation.running')
              : translate('settings.simulation.description')}
          </Text>
        </View>

        <View
          className={`size-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      </View>

      <View className="flex-row gap-2">
        {!isRunning ? (
          <>
            <Button
              onPress={() => onStart(false)}
              disabled={disabled}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              label={translate('settings.simulation.start_5min')}
            />
            <Button
              onPress={() => onStart(true)}
              disabled={disabled}
              className="flex-1 bg-green-600 hover:bg-green-700"
              label={translate('settings.simulation.start_fast')}
            />
          </>
        ) : (
          <Button
            onPress={onStop}
            disabled={disabled}
            variant="destructive"
            className="flex-1"
            label={translate('settings.simulation.stop')}
          />
        )}
      </View>

      {isRunning && (
        <View className="mt-3 rounded bg-blue-100 p-2 dark:bg-blue-800/30">
          <Text className="text-center text-xs text-blue-800 dark:text-blue-200">
            💡 {translate('settings.simulation.help_text')}
          </Text>
        </View>
      )}
    </View>
  );
}

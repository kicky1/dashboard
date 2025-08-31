import * as React from 'react';

import { Text, View } from '@/components/ui';

type Props = {
  text: string;
};
export const Title = ({ text }: Props) => {
  return (
    <View className="flex-row items-center justify-center py-4 pb-2">
      <Text className="pr-2 text-2xl text-neutral-900 dark:text-white">
        {text}
      </Text>
      <View className="h-[2px] flex-1 bg-neutral-300 dark:bg-neutral-600" />
    </View>
  );
};

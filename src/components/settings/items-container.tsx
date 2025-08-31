import React from 'react';

import { Text, View } from '@/components/ui';
import type { TxKeyPath } from '@/lib';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export const ItemsContainer = ({ children, title }: Props) => {
  return (
    <>
      {title && (
        <Text
          className="pb-2 pt-4 text-lg text-neutral-900 dark:text-white"
          tx={title}
        />
      )}
      {
        <View className="rounded-md border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          {children}
        </View>
      }
    </>
  );
};

import { Linking } from 'react-native';
import type { StoreApi, UseBoundStore } from 'zustand';

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

// Currency formatting utilities
export const formatCurrency = (
  amount: number,
  currency: 'USD' | 'PLN',
  locale: string
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
};

export const formatAmount = (
  amount: number,
  currency: 'USD' | 'PLN'
): string => {
  if (currency === 'PLN') {
    return `${amount.toLocaleString('pl-PL')} zł`;
  }
  return `$${amount.toLocaleString('en-US')}`;
};

// Exchange rate utilities
type CurrencyConversion = {
  amount: number;
  fromCurrency: 'USD' | 'PLN';
  toCurrency: 'USD' | 'PLN';
  rate: number;
};

export const convertCurrency = ({
  amount,
  fromCurrency,
  toCurrency,
  rate,
}: CurrencyConversion): number => {
  if (fromCurrency === toCurrency) return amount;

  if (fromCurrency === 'USD' && toCurrency === 'PLN') {
    return amount * rate;
  }

  if (fromCurrency === 'PLN' && toCurrency === 'USD') {
    return amount / rate;
  }

  return amount;
};

/**
 * Generate a random UUID v4
 * Compatible with React Native
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Translates expense category from English to Polish if the language is Polish
 * @param category - The category name in English
 * @param language - The current language ('en' | 'pl')
 * @returns The translated category name
 */
export function translateExpenseCategory(
  category: string,
  language: string
): string {
  if (language !== 'pl') {
    return category;
  }

  const categoryMap: Record<string, string> = {
    food: 'Jedzenie',
    shopping: 'Zakupy',
    transport: 'Transport',
    utilities: 'Media',
    entertainment: 'Rozrywka',
    healthcare: 'Opieka zdrowotna',
    education: 'Edukacja',
    other: 'Inne',
  };

  return categoryMap[category.toLowerCase()] || category;
}

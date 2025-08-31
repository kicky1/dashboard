import en from '@/translations/en.json';
import pl from '@/translations/pl.json';

export const resources = {
  en: {
    translation: en,
  },
  pl: {
    translation: pl,
  },
};

export type Language = keyof typeof resources;

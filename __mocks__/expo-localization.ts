export const locale = 'en-US';
export const locales = ['en-US'];
export const timezone = 'UTC';
export const isRTL = false;

// Mock getLocales function
export const getLocales = () => [
  {
    languageCode: 'en',
    countryCode: 'US',
    languageTag: 'en-US',
    decimalSeparator: '.',
    groupingSeparator: ',',
  },
];

// Mock getLanguage function
export const getLanguage = () => 'en';

// Mock getCountry function
export const getCountry = () => 'US';

// Mock getTimeZone function
export const getTimeZone = () => 'UTC';

// Mock getCurrencyCode function
export const getCurrencyCode = () => 'USD';

// Mock getDecimalSeparator function
export const getDecimalSeparator = () => '.';

// Mock getGroupingSeparator function
export const getGroupingSeparator = () => ',';

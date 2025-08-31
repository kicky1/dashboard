import { convertCurrency, formatAmount } from './utils';

// Free Exchange Rate API - no API key required for basic usage
const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export type Currency = 'USD' | 'PLN';

export interface CurrencyData {
  currency: Currency;
  rate: number;
  lastUpdated: Date;
}

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private exchangeRates: Map<string, CurrencyData> = new Map();
  private lastFetchTime: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

  private constructor() {
    this.initializeRates();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private initializeRates(): void {
    // Set default rates as fallback
    this.exchangeRates.set('USD_PLN', {
      currency: 'PLN',
      rate: 4.15,
      lastUpdated: new Date(),
    });

    this.exchangeRates.set('PLN_USD', {
      currency: 'USD',
      rate: 1 / 4.15,
      lastUpdated: new Date(),
    });
  }

  private shouldFetchNewRates(): boolean {
    if (!this.lastFetchTime) return true;

    const now = new Date();
    const timeDiff = now.getTime() - this.lastFetchTime.getTime();
    return timeDiff > this.CACHE_DURATION;
  }

  public async fetchLatestRates(): Promise<void> {
    try {
      // Check if we need to fetch new rates
      if (!this.shouldFetchNewRates()) {
        console.log('Using cached exchange rates');
        return;
      }

      console.log('Fetching latest exchange rates...');

      // Create a timeout promise for React Native compatibility
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
      });

      const fetchPromise = fetch(EXCHANGE_RATE_API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();

      // Update PLN rate
      const plnRate = data.rates.PLN;
      if (plnRate) {
        this.exchangeRates.set('USD_PLN', {
          currency: 'PLN',
          rate: plnRate,
          lastUpdated: new Date(),
        });

        this.exchangeRates.set('PLN_USD', {
          currency: 'USD',
          rate: 1 / plnRate,
          lastUpdated: new Date(),
        });

        this.lastFetchTime = new Date();
        console.log(`Updated PLN rate: 1 USD = ${plnRate} PLN`);
      } else {
        console.warn('PLN rate not found in API response, using cached rate');
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      console.log('Using cached exchange rates as fallback');

      // If it's a timeout error, we might want to retry later
      if (error instanceof Error && error.message === 'Request timeout') {
        console.log('Request timed out, will retry on next attempt');
      }
    }
  }

  // Method to force refresh rates (useful for manual refresh)
  public async forceRefreshRates(): Promise<void> {
    this.lastFetchTime = null; // Reset cache
    await this.fetchLatestRates();
  }

  // Method to check if rates are stale and need updating
  public isRatesStale(): boolean {
    return this.shouldFetchNewRates();
  }

  // Method to get the last update time for debugging
  public getLastUpdateTime(): Date | null {
    return this.lastFetchTime;
  }

  public async getRate(
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<number> {
    // Ensure we have fresh rates
    await this.fetchLatestRates();

    if (fromCurrency === toCurrency) return 1;

    const key = `${fromCurrency}_${toCurrency}`;
    const data = this.exchangeRates.get(key);

    if (!data) {
      throw new Error(
        `Exchange rate not found for ${fromCurrency} to ${toCurrency}`
      );
    }

    return data.rate;
  }

  // Method to get multiple rates at once (more efficient than multiple getRate calls)
  public async getMultipleRates(
    fromCurrency: Currency,
    toCurrencies: Currency[]
  ): Promise<Record<Currency, number>> {
    // Ensure we have fresh rates
    await this.fetchLatestRates();

    const rates: Record<Currency, number> = {} as Record<Currency, number>;

    for (const toCurrency of toCurrencies) {
      if (fromCurrency === toCurrency) {
        rates[toCurrency] = 1;
      } else {
        const key = `${fromCurrency}_${toCurrency}`;
        const data = this.exchangeRates.get(key);

        if (!data) {
          throw new Error(
            `Exchange rate not found for ${fromCurrency} to ${toCurrency}`
          );
        }

        rates[toCurrency] = data.rate;
      }
    }

    return rates;
  }

  public formatAmount(amount: number, currency: Currency): string {
    return formatAmount(amount, currency);
  }

  public async convertAmount(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const rate = await this.getRate(fromCurrency, toCurrency);
    return convertCurrency({ amount, fromCurrency, toCurrency, rate });
  }

  // Method to convert multiple amounts at once using a single exchange rate
  public async convertMultipleAmounts(
    amounts: Record<string, number>,
    fromCurrency: Currency,
    toCurrency: Currency
  ): Promise<Record<string, number>> {
    if (fromCurrency === toCurrency) return amounts;

    const rate = await this.getRate(fromCurrency, toCurrency);

    const converted: Record<string, number> = {};
    for (const [key, amount] of Object.entries(amounts)) {
      converted[key] = convertCurrency({
        amount,
        fromCurrency,
        toCurrency,
        rate,
      });
    }

    return converted;
  }

  public getCurrencyForLanguage(language: string): Currency {
    return language === 'pl' ? 'PLN' : 'USD';
  }

  public getCachedRate(
    fromCurrency: Currency,
    toCurrency: Currency
  ): number | null {
    if (fromCurrency === toCurrency) return 1;

    const key = `${fromCurrency}_${toCurrency}`;
    const data = this.exchangeRates.get(key);

    return data ? data.rate : null;
  }
}

export const currencyService = CurrencyService.getInstance();

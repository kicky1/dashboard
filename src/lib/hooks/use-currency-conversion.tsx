import { useEffect, useState } from 'react';

import { type Currency, currencyService } from '@/lib/currency';

// Simple hook to fetch exchange rate once
export function useExchangeRate(currency: Currency) {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No conversion needed for USD
    if (currency === 'USD') {
      setRate(1);
      return;
    }

    let cancelled = false;

    const fetchRate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const exchangeRate = await currencyService.getRate('USD', currency);

        if (!cancelled) {
          setRate(exchangeRate);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch exchange rate:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch rate');
          // Fallback to 1:1 rate
          setRate(1);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRate();

    return () => {
      cancelled = true;
    };
  }, [currency]);

  return { rate, isLoading, error };
}

// Simple utility functions to convert values
export function convertAmount(amount: number, rate: number | null): number {
  if (!rate || rate === 1) return amount;
  return amount * rate;
}

export function convertExpense(expense: any, rate: number | null) {
  if (!rate || rate === 1) {
    return {
      ...expense,
      convertedAmount: expense.amount,
    };
  }

  return {
    ...expense,
    convertedAmount: expense.amount * rate,
  };
}

export function convertIncome(income: any, rate: number | null) {
  if (!rate || rate === 1) {
    return {
      ...income,
      convertedAmount: income.amount,
    };
  }

  return {
    ...income,
    convertedAmount: income.amount * rate,
  };
}

// Legacy hook names for backward compatibility (but much simpler)
export function useCurrencyConversion(baseAmounts: any, currency: Currency) {
  const { rate, isLoading, error } = useExchangeRate(currency);

  if (!baseAmounts) {
    return { isLoading: false, convertedAmounts: null, error: null };
  }

  if (currency === 'USD' || !rate) {
    return {
      isLoading,
      convertedAmounts: {
        totalBalance: baseAmounts.totalBalance,
        income: baseAmounts.income,
        expenses: baseAmounts.expenses,
        recentExpenses: baseAmounts.recentExpenses?.map((expense: any) => ({
          ...expense,
          convertedAmount: expense.amount,
        })),
      },
      error,
    };
  }

  return {
    isLoading,
    convertedAmounts: {
      totalBalance: convertAmount(baseAmounts.totalBalance, rate),
      income: convertAmount(baseAmounts.income, rate),
      expenses: convertAmount(baseAmounts.expenses, rate),
      recentExpenses: baseAmounts.recentExpenses?.map((expense: any) =>
        convertExpense(expense, rate)
      ),
    },
    error,
  };
}

export function useExpensesCurrencyConversion(
  expenses: any[],
  currency: Currency
) {
  const { rate, isLoading, error } = useExchangeRate(currency);

  if (!expenses || expenses.length === 0) {
    return { isLoading: false, convertedExpenses: [], error: null };
  }

  const convertedExpenses = expenses.map((expense) =>
    convertExpense(expense, rate)
  );

  return {
    isLoading,
    convertedExpenses,
    error,
  };
}

export function useIncomeCurrencyConversion(income: any[], currency: Currency) {
  const { rate, isLoading, error } = useExchangeRate(currency);

  if (!income || income.length === 0) {
    return { isLoading: false, convertedIncome: [], error: null };
  }

  const convertedIncome = income.map((incomeItem) =>
    convertIncome(incomeItem, rate)
  );

  return {
    isLoading,
    convertedIncome,
    error,
  };
}

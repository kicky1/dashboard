import React, { useMemo } from 'react';

import {
  FocusAwareStatusBar,
  Image,
  IncomeExpenseBarChart,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { translate, useSelectedLanguage } from '@/lib';
import { useAuthGuard } from '@/lib/auth';
import { type Currency, currencyService } from '@/lib/currency';
import {
  convertAmount,
  convertExpense,
  useExchangeRate,
} from '@/lib/hooks/use-currency-conversion';
import { useDashboardData } from '@/lib/hooks/use-dashboard-data';
import { useDashboardSettings } from '@/lib/hooks/use-dashboard-settings';
import type { Expense } from '@/types';

// Helper function to format expense date
function formatExpenseDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return translate('dashboard.time_ago.today');
  } else if (diffDays === 1) {
    return translate('dashboard.time_ago.yesterday');
  } else if (diffDays < 7) {
    return `${diffDays} ${translate('dashboard.time_ago.days_ago')}`;
  } else {
    return date.toLocaleDateString();
  }
}

// Loading component
function LoadingState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <Text className="text-lg text-neutral-600 dark:text-neutral-400">
        {message}
      </Text>
    </View>
  );
}

// Error component
function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
      <Text className="mb-2 text-center text-lg text-red-600 dark:text-red-400">
        {title}
      </Text>
      <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        {message}
      </Text>
    </View>
  );
}

export default function Dashboard() {
  const { user } = useAuthGuard();
  const { language } = useSelectedLanguage();
  const { data: dashboardData, isLoading, error } = useDashboardData();
  const { data: dashboardSettings, isLoading: settingsLoading } =
    useDashboardSettings();

  const mockUser = useMemo(
    () => ({
      name: user?.user_metadata?.full_name || user?.email || 'User',
      email: user?.email || 'user@example.com',
      photo:
        user?.user_metadata?.avatar_url || require('../../../assets/icon.png'),
    }),
    [
      user?.user_metadata?.full_name,
      user?.email,
      user?.user_metadata?.avatar_url,
    ]
  );

  // Get currency based on language - memoized to prevent recreation
  const currency: Currency = useMemo(
    () => currencyService.getCurrencyForLanguage(language),
    [language]
  );

  // Get exchange rate once for this currency
  const {
    rate,
    isLoading: isRateLoading,
    error: rateError,
  } = useExchangeRate(currency);

  // Prepare amounts for currency conversion - memoized to prevent recreation
  const amounts = useMemo(() => {
    if (!dashboardData) return null;

    return {
      totalBalance: dashboardData.totalBalance,
      income: dashboardData.totalIncome,
      expenses: dashboardData.totalExpenses,
      recentExpenses: dashboardData.recentExpenses,
    };
  }, [
    dashboardData?.totalBalance,
    dashboardData?.totalIncome,
    dashboardData?.totalExpenses,
    dashboardData?.recentExpenses,
  ]);

  // Convert amounts using the exchange rate
  const convertedAmounts = useMemo(() => {
    if (!amounts || !rate) return null;

    return {
      totalBalance: convertAmount(amounts.totalBalance, rate),
      income: convertAmount(amounts.income, rate),
      expenses: convertAmount(amounts.expenses, rate),
      recentExpenses: amounts.recentExpenses?.map((expense) =>
        convertExpense(expense, rate)
      ),
    };
  }, [amounts, rate]);

  // Show loading state while data, settings, or exchange rate are being fetched
  if (isLoading || settingsLoading || isRateLoading) {
    return <LoadingState message={`${translate('dashboard.loading')}...`} />;
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <ErrorState
        title={translate('dashboard.error')}
        message={error?.message || 'Failed to load dashboard data'}
      />
    );
  }

  // Show error state if exchange rate fetching failed
  if (rateError) {
    return (
      <ErrorState
        title={translate('dashboard.currency_error')}
        message={rateError}
      />
    );
  }

  // Don't render if we don't have converted amounts or settings
  if (!convertedAmounts || !dashboardSettings) {
    return <LoadingState message={translate('dashboard.no_data_available')} />;
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1">
        {dashboardSettings.showUserHeader && <UserHeader user={mockUser} />}
        {dashboardSettings.showBalanceCard && (
          <BalanceCard
            amounts={convertedAmounts}
            currency={currency}
            settings={dashboardSettings}
          />
        )}
        {dashboardSettings.showCharts && (
          <IncomeExpenseBarChart
            income={convertedAmounts.income}
            expenses={convertedAmounts.expenses}
          />
        )}
        {dashboardSettings.showRecentExpenses && (
          <RecentExpenses
            expenses={convertedAmounts.recentExpenses}
            currency={currency}
            _settings={dashboardSettings}
          />
        )}
        {dashboardSettings.showRecentIncome && dashboardData?.recentIncome && (
          <RecentIncome
            income={dashboardData.recentIncome}
            currency={currency}
            _settings={dashboardSettings}
          />
        )}
      </ScrollView>
    </View>
  );
}

type UserHeaderProps = {
  user: {
    name: string;
    photo: any;
    email: string;
  };
};

function UserHeader({ user }: UserHeaderProps) {
  return (
    <View className="bg-white px-4 py-6 dark:bg-neutral-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={user.photo}
            className="mr-4 size-16 rounded-full"
            contentFit="cover"
          />
          <View className="flex-1">
            <Text className="text-xl font-bold text-neutral-900 dark:text-white">
              {user.name}
            </Text>
            <Text className="text-neutral-600 dark:text-neutral-400">
              {user.email || translate('dashboard.welcome_back')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function BalanceCard({
  amounts,
  currency,
  settings,
}: {
  amounts: any;
  currency: Currency;
  settings: import('@/types').DashboardSettings;
}) {
  if (!amounts) return null;

  return (
    <View className="mb-6 px-4">
      <View className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        {settings.showTotalBalance && (
          <>
            <Text className="mb-2 text-lg font-medium text-white">
              {settings.dashboardTitle || translate('dashboard.total_balance')}
            </Text>
            <Text className="mb-4 text-3xl font-bold text-white">
              {currencyService.formatAmount(amounts.totalBalance, currency)}
            </Text>
          </>
        )}
        <View className="flex-row justify-between">
          {settings.showIncome && (
            <View>
              <Text className="text-sm text-blue-100">
                {translate('dashboard.income')}
              </Text>
              <Text className="font-semibold text-white">
                +{currencyService.formatAmount(amounts.income, currency)}
              </Text>
            </View>
          )}
          {settings.showExpenses && (
            <View>
              <Text className="text-sm text-blue-100">
                {translate('dashboard.expenses')}
              </Text>
              <Text className="font-semibold text-white">
                -{currencyService.formatAmount(amounts.expenses, currency)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function RecentExpenses({
  expenses,
  currency,
  _settings,
}: {
  expenses: (Expense & { convertedAmount: number })[] | undefined;
  currency: Currency;
  _settings: import('@/types').DashboardSettings;
}) {
  if (!expenses || expenses.length === 0) {
    return (
      <View className="mb-6 px-4">
        <Text className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
          {translate('dashboard.recent_expenses')}
        </Text>
        <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
          <Text className="text-center text-neutral-600 dark:text-neutral-400">
            {translate('dashboard.no_expenses')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6 px-4">
      <Text className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
        {translate('dashboard.recent_expenses')}
      </Text>
      <View className="gap-3 space-y-3">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            title={expense.title}
            amount={currencyService.formatAmount(
              expense.convertedAmount,
              currency
            )}
            category={expense.category}
            expense_date={formatExpenseDate(expense.date)}
          />
        ))}
      </View>
    </View>
  );
}

function RecentIncome({
  income,
  currency,
  _settings,
}: {
  income: import('@/types').Income[];
  currency: Currency;
  _settings: import('@/types').DashboardSettings;
}) {
  if (!income || income.length === 0) {
    return (
      <View className="mb-6 px-4">
        <Text className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
          {translate('dashboard.recent_income')}
        </Text>
        <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
          <Text className="text-center text-neutral-600 dark:text-neutral-400">
            {translate('dashboard.no_income')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6 px-4">
      <Text className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
        {translate('dashboard.recent_income')}
      </Text>
      <View className="gap-3 space-y-3">
        {income.map((inc) => (
          <IncomeItem
            key={inc.id}
            title={inc.title}
            amount={currencyService.formatAmount(inc.amount, currency)}
            category={inc.category}
            income_date={formatExpenseDate(inc.date)}
          />
        ))}
      </View>
    </View>
  );
}

type ExpenseItemProps = {
  title: string;
  amount: string;
  category: string;
  expense_date: string;
};

function ExpenseItem({
  title,
  amount,
  category,
  expense_date,
}: ExpenseItemProps) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-white p-4 dark:bg-neutral-800">
      <View className="flex-1">
        <Text className="font-medium text-neutral-900 dark:text-white">
          {title}
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {category} • {expense_date}
        </Text>
      </View>
      <Text className="text-lg font-semibold text-red-500">{amount}</Text>
    </View>
  );
}

type IncomeItemProps = {
  title: string;
  amount: string;
  category: string;
  income_date: string;
};

function IncomeItem({ title, amount, category, income_date }: IncomeItemProps) {
  return (
    <View className="flex-row items-center justify-between rounded-xl bg-white p-4 dark:bg-neutral-800">
      <View className="flex-1">
        <Text className="font-medium text-neutral-900 dark:text-white">
          {title}
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {category} • {income_date}
        </Text>
      </View>
      <Text className="text-lg font-semibold text-green-500">+{amount}</Text>
    </View>
  );
}

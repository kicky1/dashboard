import { useColorScheme } from 'nativewind';
import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { translate, useSelectedLanguage } from '@/lib';

type BarChartData = {
  value: number;
  label: string;
  frontColor: string;
  gradientColor?: string;
};

type IncomeExpenseBarChartProps = {
  income: number;
  expenses: number;
};

export function IncomeExpenseBarChart({
  income,
  expenses,
}: IncomeExpenseBarChartProps) {
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const { language } = useSelectedLanguage();

  // Don't render if no data
  if (income === 0 && expenses === 0) {
    return null;
  }

  const chartData: BarChartData[] = [
    {
      value: income,
      label: translate('dashboard.income'),
      frontColor: '#10B981', // Green for income
      gradientColor: '#059669',
    },
    {
      value: expenses,
      label: translate('dashboard.expenses'),
      frontColor: '#EF4444', // Red for expenses
      gradientColor: '#DC2626',
    },
  ];

  // Filter out zero values for cleaner chart
  const filteredData = chartData.filter((item) => item.value > 0);

  if (filteredData.length === 0) {
    return null;
  }

  // Calculate responsive bar width and spacing
  const availableWidth = width - 80; // Account for padding (32px on each side)
  const barWidth = Math.min(60, availableWidth / 4); // Max 60px, or 1/4 of available width
  const spacing = Math.max(
    20,
    (availableWidth - barWidth * filteredData.length) /
      (filteredData.length + 1)
  );

  // Theme-aware text colors
  const textColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const axisColor = colorScheme === 'dark' ? '#6B7280' : '#D1D5DB';

  // Dynamic currency suffix based on language
  const currencySuffix = language === 'pl' ? ' zł' : ' USD';

  return (
    <View className="mb-6 px-4">
      <Text className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">
        {translate('dashboard.income_vs_expenses')}
      </Text>
      <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        <View
          className="items-center overflow-hidden"
          style={{ width: availableWidth }}
        >
          <BarChart
            data={filteredData}
            barWidth={barWidth}
            spacing={spacing}
            hideRules
            xAxisLabelTextStyle={{
              color: textColor,
              fontSize: 12,
              fontWeight: '500',
            }}
            yAxisTextStyle={{
              color: textColor,
              fontSize: 12,
              fontWeight: '500',
            }}
            yAxisLabelWidth={70}
            showVerticalLines={false}
            horizontalRulesStyle={{
              strokeColor: axisColor,
              strokeWidth: 1,
            }}
            width={availableWidth}
            xAxisColor={axisColor}
            yAxisColor={axisColor}
            xAxisThickness={1}
            yAxisThickness={1}
            noOfSections={4}
            yAxisLabelSuffix={currencySuffix}
          />
        </View>
      </View>
    </View>
  );
}

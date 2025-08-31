import type { Expense, Income } from '@/types';

import { dashboardSettingsApi } from './dashboard-settings';
import { expensesApi } from './expenses';
import { incomeApi } from './income';

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  recentExpenses: Expense[];
  recentIncome: Income[];
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export const dashboardApi = {
  // Get complete dashboard data with configurable limits
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Get dashboard settings to determine what to show
      const settings = await dashboardSettingsApi.getDashboardSettings();

      const [expenses, income] = await Promise.all([
        expensesApi.getExpenses(),
        incomeApi.getIncome(),
      ]);

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const totalBalance = totalIncome - totalExpenses;

      // Get recent expenses based on settings
      const recentExpenses = settings.showRecentExpenses
        ? expenses
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, settings.recentExpensesLimit)
        : [];

      // Get recent income based on settings
      const recentIncome = settings.showRecentIncome
        ? income
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, settings.recentIncomeLimit)
        : [];

      return {
        totalBalance,
        totalIncome,
        totalExpenses,
        recentExpenses,
        recentIncome,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard data: ${error}`);
    }
  },

  // Get only summary data (totals)
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const [expenses, income] = await Promise.all([
        expensesApi.getExpenses(),
        incomeApi.getIncome(),
      ]);

      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
      const totalBalance = totalIncome - totalExpenses;

      return {
        totalBalance,
        totalIncome,
        totalExpenses,
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard summary: ${error}`);
    }
  },

  // Get recent expenses with configurable limit
  async getRecentExpenses(limit?: number): Promise<Expense[]> {
    try {
      const settings = await dashboardSettingsApi.getDashboardSettings();
      const expensesLimit = limit || settings.recentExpensesLimit;

      const expenses = await expensesApi.getExpenses();
      return expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, expensesLimit);
    } catch (error) {
      throw new Error(`Failed to fetch recent expenses: ${error}`);
    }
  },

  // Get recent income with configurable limit
  async getRecentIncome(limit?: number): Promise<Income[]> {
    try {
      const settings = await dashboardSettingsApi.getDashboardSettings();
      const incomeLimit = limit || settings.recentIncomeLimit;

      const income = await incomeApi.getIncome();
      return income
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, incomeLimit);
    } catch (error) {
      throw new Error(`Failed to fetch recent income: ${error}`);
    }
  },
};

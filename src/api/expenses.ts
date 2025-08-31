import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types';

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface UpdateExpenseData {
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
  notes?: string;
}

export const expensesApi = {
  // Get all expenses for the current user
  async getExpenses(): Promise<Expense[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expenses: ${error.message}`);
    }

    return data || [];
  },

  // Create a new expense
  async createExpense(expenseData: CreateExpenseData): Promise<Expense> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expenseData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create expense: ${error.message}`);
    }

    return data;
  },

  // Update an existing expense
  async updateExpense(
    id: string,
    expenseData: UpdateExpenseData
  ): Promise<Expense> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    return data;
  },

  // Delete an expense
  async deleteExpense(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete expense: ${error.message}`);
    }
  },

  // Get expenses by category
  async getExpensesByCategory(category: string): Promise<Expense[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch expenses by category: ${error.message}`);
    }

    return data || [];
  },

  // Get total expenses amount
  async getTotalExpenses(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to fetch total expenses: ${error.message}`);
    }

    return (data || []).reduce((sum, expense) => sum + expense.amount, 0);
  },
};

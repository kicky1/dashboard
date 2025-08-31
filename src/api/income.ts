import { supabase } from '@/lib/supabase';
import type { Income } from '@/types';

export interface CreateIncomeData {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface UpdateIncomeData {
  title?: string;
  amount?: number;
  category?: string;
  date?: string;
  notes?: string;
}

export const incomeApi = {
  // Get all income for the current user
  async getIncome(): Promise<Income[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch income: ${error.message}`);
    }

    return data || [];
  },

  // Create a new income entry
  async createIncome(incomeData: CreateIncomeData): Promise<Income> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('income')
      .insert({
        ...incomeData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create income: ${error.message}`);
    }

    return data;
  },

  // Update an existing income entry
  async updateIncome(
    id: string,
    incomeData: UpdateIncomeData
  ): Promise<Income> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('income')
      .update(incomeData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update income: ${error.message}`);
    }

    return data;
  },

  // Delete an income entry
  async deleteIncome(id: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete income: ${error.message}`);
    }
  },

  // Get income by category
  async getIncomeByCategory(category: string): Promise<Income[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch income by category: ${error.message}`);
    }

    return data || [];
  },

  // Get total income amount
  async getTotalIncome(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to fetch total income: ${error.message}`);
    }

    return (data || []).reduce((sum, income) => sum + income.amount, 0);
  },
};

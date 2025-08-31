import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  type CreateExpenseData,
  expensesApi,
  type UpdateExpenseData,
} from '@/api/expenses';
import {
  Button,
  FocusAwareStatusBar,
  Input,
  Modal,
  ScrollView,
  Select,
  Text,
  useModal,
  View,
} from '@/components/ui';
import { Plus } from '@/components/ui/icons';
import { translate, useSelectedLanguage } from '@/lib';
import { useAuthGuard } from '@/lib/auth';
import { type Currency, currencyService } from '@/lib/currency';
import {
  convertExpense,
  useExchangeRate,
} from '@/lib/hooks/use-currency-conversion';
import type { Expense } from '@/types';

// Expense categories
const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'expenses.categories.food' },
  { value: 'transport', label: 'expenses.categories.transport' },
  { value: 'entertainment', label: 'expenses.categories.entertainment' },
  { value: 'utilities', label: 'expenses.categories.utilities' },
  { value: 'healthcare', label: 'expenses.categories.healthcare' },
  { value: 'shopping', label: 'expenses.categories.shopping' },
  { value: 'education', label: 'expenses.categories.education' },
  { value: 'other', label: 'expenses.categories.other' },
] as const;

// Form data type
type FormData = {
  title: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
};

// Custom hook for expense state management
function useExpenseState() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  return {
    editingExpense,
    setEditingExpense,
    formData,
    setFormData,
  };
}

// Custom hook for form actions
function useFormActions(
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  _setEditingExpense: React.Dispatch<React.SetStateAction<Expense | null>>
) {
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    _setEditingExpense(null);
  }, [setFormData, _setEditingExpense]);

  const openAddModal = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const openEditModal = useCallback(
    (expense: Expense) => {
      setFormData({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date,
        notes: expense.notes || '',
      });
      _setEditingExpense(expense);
    },
    [setFormData, _setEditingExpense]
  );

  const closeModal = useCallback(() => {
    resetForm();
  }, [resetForm]);

  return {
    openAddModal,
    openEditModal,
    closeModal,
  };
}

// Custom hook for expense operations
function useExpenseOperations({
  _setEditingExpense,
  closeModal,
}: {
  _setEditingExpense: React.Dispatch<React.SetStateAction<Expense | null>>;
  closeModal: () => void;
}) {
  const queryClient = useQueryClient();

  const createExpenseMutation = useMutation({
    mutationFn: (data: CreateExpenseData) => expensesApi.createExpense(data),
    onSuccess: () => {
      // Invalidate both expenses and dashboard queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
      closeModal();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: () => {
      // Invalidate both expenses and dashboard queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
      closeModal();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      // Invalidate both expenses and dashboard queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSave = useCallback(
    (formData: FormData, editingExpense: Expense | null) => {
      if (!formData.title || !formData.amount) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      const expenseData = {
        title: formData.title,
        amount,
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
      };

      if (editingExpense) {
        updateExpenseMutation.mutate({
          id: editingExpense.id,
          data: expenseData,
        });
      } else {
        createExpenseMutation.mutate(expenseData);
      }
    },
    [createExpenseMutation, updateExpenseMutation]
  );

  const handleDelete = useCallback(
    (expense: Expense) => {
      Alert.alert(
        translate('expenses.delete_expense'),
        translate('expenses.form.confirm_delete'),
        [
          { text: translate('expenses.form.cancel'), style: 'cancel' },
          {
            text: translate('expenses.form.delete'),
            style: 'destructive',
            onPress: () => {
              deleteExpenseMutation.mutate(expense.id);
            },
          },
        ]
      );
    },
    [deleteExpenseMutation]
  );

  return {
    handleSave,
    handleDelete,
    isLoading:
      createExpenseMutation.isPending ||
      updateExpenseMutation.isPending ||
      deleteExpenseMutation.isPending,
  };
}

export default function ExpensesPage() {
  useAuthGuard();
  const { language } = useSelectedLanguage();
  const { editingExpense, setEditingExpense, formData, setFormData } =
    useExpenseState();
  const { ref: modalRef, present, dismiss } = useModal();
  const { colorScheme } = useColorScheme();

  const { openAddModal, openEditModal, closeModal } = useFormActions(
    setFormData,
    setEditingExpense
  );

  const { handleSave, handleDelete, isLoading } = useExpenseOperations({
    _setEditingExpense: setEditingExpense,
    closeModal: () => {
      dismiss();
      closeModal();
    },
  });

  // Fetch expenses from Supabase
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesApi.getExpenses,
  });

  const currency: Currency = currencyService.getCurrencyForLanguage(language);

  // Get exchange rate once for this currency
  const {
    rate,
    isLoading: isRateLoading,
    error: rateError,
  } = useExchangeRate(currency);

  // Convert expenses using the exchange rate
  const convertedExpenses = useMemo(() => {
    if (!expenses || !rate) return [];
    return expenses.map((expense) => convertExpense(expense, rate));
  }, [expenses, rate]);

  // Calculate total from converted amounts
  const totalExpenses = useMemo(() => {
    return convertedExpenses.reduce((sum, exp) => sum + exp.convertedAmount, 0);
  }, [convertedExpenses]);

  const handleOpenAddModal = useCallback(() => {
    openAddModal();
    present();
  }, [openAddModal, present]);

  const handleOpenEditModal = useCallback(
    (expense: Expense) => {
      openEditModal(expense);
      present();
    },
    [openEditModal, present]
  );

  if (isLoadingExpenses || isRateLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Text className="text-neutral-600 dark:text-neutral-400">
          {isRateLoading
            ? translate('dashboard.currency_conversion')
            : translate('dashboard.loading')}
        </Text>
      </View>
    );
  }

  if (rateError) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <Text className="text-red-500 dark:text-red-400">
          {translate('dashboard.currency_error')}: {rateError}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FocusAwareStatusBar />
      <View className="bg-neutral-50 px-4 py-12 dark:bg-neutral-900"></View>
      <ScrollView className="flex-1">
        <ExpensesHeader
          totalExpenses={totalExpenses}
          currency={currency}
          onAddExpense={handleOpenAddModal}
          colorScheme={colorScheme}
        />
        <ExpensesList
          expenses={convertedExpenses}
          currency={currency}
          onEditExpense={handleOpenEditModal}
          onDeleteExpense={handleDelete}
        />
      </ScrollView>

      <Modal
        ref={modalRef}
        snapPoints={['80%']}
        title={
          editingExpense
            ? translate('expenses.edit_expense')
            : translate('expenses.add_expense')
        }
      >
        <ExpenseForm
          _editingExpense={editingExpense}
          formData={formData}
          setFormData={setFormData}
          onSave={() => handleSave(formData, editingExpense)}
          onCancel={() => {
            dismiss();
            closeModal();
          }}
          isLoading={isLoading}
        />
      </Modal>
    </View>
  );
}

type ExpensesHeaderProps = {
  totalExpenses: number;
  currency: Currency;
  onAddExpense: () => void;
  colorScheme: 'light' | 'dark' | undefined;
};

function ExpensesHeader({
  totalExpenses,
  currency,
  onAddExpense,
  colorScheme,
}: ExpensesHeaderProps) {
  return (
    <View className="bg-neutral-50 p-4 dark:bg-neutral-900">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
            {translate('dashboard.expenses')}:{' '}
            {currencyService.formatAmount(totalExpenses, currency)}
          </Text>
        </View>
        <Button onPress={onAddExpense}>
          <Plus color={colorScheme !== 'dark' ? '#ffffff' : '#000000'} />
        </Button>
      </View>
    </View>
  );
}

type ExpensesListProps = {
  expenses: (Expense & { convertedAmount: number })[];
  currency: Currency;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
};

function ExpensesList({
  expenses,
  currency,
  onEditExpense,
  onDeleteExpense,
}: ExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4 pt-24">
        <Text className="mb-2 text-lg text-neutral-600 dark:text-neutral-400">
          {translate('expenses.no_expenses')}
        </Text>
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-500">
          {translate('expenses.add_your_first')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4">
      <View className="space-y-3">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            currency={currency}
            onEdit={() => onEditExpense(expense)}
            onDelete={() => onDeleteExpense(expense)}
          />
        ))}
      </View>
    </View>
  );
}

type ExpenseFormProps = {
  _editingExpense: Expense | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function ExpenseForm({
  _editingExpense,
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
}: ExpenseFormProps) {
  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title });
  };

  const handleAmountChange = (amount: string) => {
    setFormData({ ...formData, amount });
  };

  const handleCategoryChange = (category: string | number) => {
    setFormData({
      ...formData,
      category: category as string,
    });
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date });
  };

  return (
    <View className="p-6">
      <View className="space-y-4">
        <Input
          label={translate('expenses.form.title')}
          value={formData.title}
          onChangeText={handleTitleChange}
          placeholder="Enter expense title"
        />

        <Input
          label={translate('expenses.form.amount')}
          value={formData.amount}
          onChangeText={handleAmountChange}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Select
          label={translate('expenses.form.category')}
          value={formData.category}
          onSelect={handleCategoryChange}
          options={EXPENSE_CATEGORIES.map((cat) => ({
            value: cat.value,
            label: translate(cat.label),
          }))}
        />

        <Input
          label={translate('expenses.form.date')}
          value={formData.date}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View className="mt-6 flex-row gap-2">
        <Button
          onPress={onCancel}
          className="flex-1 bg-neutral-300 dark:bg-neutral-600"
        >
          <Text className="text-neutral-700 dark:text-neutral-300">
            {translate('expenses.form.cancel')}
          </Text>
        </Button>
        <Button onPress={onSave} className="flex-1 " disabled={isLoading}>
          <Text className="text-neutral-300 dark:text-neutral-700">
            {isLoading
              ? translate('expenses.form.saving')
              : translate('expenses.form.save')}
          </Text>
        </Button>
      </View>
    </View>
  );
}

type ExpenseCardProps = {
  expense: Expense & { convertedAmount: number };
  currency: Currency;
  onEdit: () => void;
  onDelete: () => void;
};

function ExpenseCard({
  expense,
  currency,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'transport':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'utilities':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'healthcare':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'shopping':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'education':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'food':
        return translate('expenses.categories.food');
      case 'transport':
        return translate('expenses.categories.transport');
      case 'entertainment':
        return translate('expenses.categories.entertainment');
      case 'utilities':
        return translate('expenses.categories.utilities');
      case 'healthcare':
        return translate('expenses.categories.healthcare');
      case 'shopping':
        return translate('expenses.categories.shopping');
      case 'education':
        return translate('expenses.categories.education');
      default:
        return translate('expenses.categories.other');
    }
  };

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
            {expense.title}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {expense.date}
          </Text>
        </View>
        <Text className="text-xl font-bold text-red-500">
          -{currencyService.formatAmount(expense.convertedAmount, currency)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <View
            className={`rounded-full px-3 py-1 ${getCategoryColor(
              expense.category
            )}`}
          >
            <Text className="text-xs font-medium">
              {getCategoryLabel(expense.category)}
            </Text>
          </View>
          {expense.notes && (
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {expense.notes}
            </Text>
          )}
        </View>

        <View className="flex-row gap-2">
          <Button onPress={onEdit} variant="outline">
            <Text className="text-xs text-neutral-700 dark:text-neutral-300">
              {translate('expenses.actions.edit')}
            </Text>
          </Button>
          <Button onPress={onDelete} variant="outline">
            <Text className="text-xs text-neutral-700 dark:text-neutral-300">
              {translate('expenses.actions.delete')}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

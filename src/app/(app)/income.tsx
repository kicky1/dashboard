import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  type CreateIncomeData,
  incomeApi,
  type UpdateIncomeData,
} from '@/api/income';
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
  convertIncome,
  useExchangeRate,
} from '@/lib/hooks/use-currency-conversion';
import type { Income } from '@/types';

// Income categories
const INCOME_CATEGORIES = [
  { value: 'employment', label: 'income.categories.employment' },
  { value: 'freelance', label: 'income.categories.freelance' },
  { value: 'investment', label: 'income.categories.investment' },
  { value: 'business', label: 'income.categories.business' },
  { value: 'rental', label: 'income.categories.rental' },
  { value: 'other', label: 'income.categories.other' },
] as const;

// Form data type
type FormData = {
  title: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
};

// Custom hook for income state management
function useIncomeState() {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    amount: '',
    category: 'employment',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  return {
    editingIncome,
    setEditingIncome,
    formData,
    setFormData,
  };
}

// Custom hook for form actions
function useFormActions(
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  _setEditingIncome: React.Dispatch<React.SetStateAction<Income | null>>
) {
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      amount: '',
      category: 'employment',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    _setEditingIncome(null);
  }, [setFormData, _setEditingIncome]);

  const openAddModal = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const openEditModal = useCallback(
    (income: Income) => {
      setFormData({
        title: income.title,
        amount: income.amount.toString(),
        category: income.category,
        date: income.date,
        notes: income.notes || '',
      });
      _setEditingIncome(income);
    },
    [setFormData, _setEditingIncome]
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

// Custom hook for income operations
function useIncomeOperations({
  _setEditingIncome,
  closeModal,
}: {
  _setEditingIncome: React.Dispatch<React.SetStateAction<Income | null>>;
  closeModal: () => void;
}) {
  const queryClient = useQueryClient();

  const createIncomeMutation = useMutation({
    mutationFn: (data: CreateIncomeData) => incomeApi.createIncome(data),
    onSuccess: () => {
      // Invalidate both income and dashboard queries
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-income'] });
      closeModal();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeData }) =>
      incomeApi.updateIncome(id, data),
    onSuccess: () => {
      // Invalidate both income and dashboard queries
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-income'] });
      closeModal();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => incomeApi.deleteIncome(id),
    onSuccess: () => {
      // Invalidate both income and dashboard queries
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-income'] });
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSave = useCallback(
    (formData: FormData, editingIncome: Income | null) => {
      if (!formData.title || !formData.amount) {
        Alert.alert('Error', translate('income.form.fill_required_fields'));
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Error', translate('income.form.valid_amount'));
        return;
      }

      const incomeData = {
        title: formData.title,
        amount,
        category: formData.category,
        date: formData.date,
        notes: formData.notes,
      };

      if (editingIncome) {
        updateIncomeMutation.mutate({
          id: editingIncome.id,
          data: incomeData,
        });
      } else {
        createIncomeMutation.mutate(incomeData);
      }
    },
    [createIncomeMutation, updateIncomeMutation]
  );

  const handleDelete = useCallback(
    (income: Income) => {
      Alert.alert(
        translate('income.delete_income'),
        translate('income.form.confirm_delete'),
        [
          { text: translate('income.form.cancel'), style: 'cancel' },
          {
            text: translate('income.form.delete'),
            style: 'destructive',
            onPress: () => {
              deleteIncomeMutation.mutate(income.id);
            },
          },
        ]
      );
    },
    [deleteIncomeMutation]
  );

  return {
    handleSave,
    handleDelete,
    isLoading:
      createIncomeMutation.isPending ||
      updateIncomeMutation.isPending ||
      deleteIncomeMutation.isPending,
  };
}

export default function IncomePage() {
  useAuthGuard();
  const { language } = useSelectedLanguage();
  const { editingIncome, setEditingIncome, formData, setFormData } =
    useIncomeState();
  const { ref: modalRef, present, dismiss } = useModal();
  const { colorScheme } = useColorScheme();

  const { openAddModal, openEditModal, closeModal } = useFormActions(
    setFormData,
    setEditingIncome
  );

  const { handleSave, handleDelete, isLoading } = useIncomeOperations({
    _setEditingIncome: setEditingIncome,
    closeModal: () => {
      dismiss();
      closeModal();
    },
  });

  // Fetch income from Supabase
  const { data: income = [], isLoading: isLoadingIncome } = useQuery({
    queryKey: ['income'],
    queryFn: incomeApi.getIncome,
  });

  const currency: Currency = currencyService.getCurrencyForLanguage(language);

  // Get exchange rate once for this currency
  const {
    rate,
    isLoading: isRateLoading,
    error: rateError,
  } = useExchangeRate(currency);

  // Convert income using the exchange rate
  const convertedIncome = useMemo(() => {
    if (!income || !rate) return [];
    return income.map((incomeItem) => convertIncome(incomeItem, rate));
  }, [income, rate]);

  // Calculate total from converted amounts
  const totalIncome = useMemo(() => {
    return convertedIncome.reduce((sum, inc) => sum + inc.convertedAmount, 0);
  }, [convertedIncome]);

  const handleOpenAddModal = useCallback(() => {
    openAddModal();
    present();
  }, [openAddModal, present]);

  const handleOpenEditModal = useCallback(
    (income: Income) => {
      openEditModal(income);
      present();
    },
    [openEditModal, present]
  );

  if (isLoadingIncome || isRateLoading) {
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
        <IncomeHeader
          totalIncome={totalIncome}
          currency={currency}
          onAddIncome={handleOpenAddModal}
          colorScheme={colorScheme}
        />
        <IncomeList
          income={convertedIncome}
          currency={currency}
          onEditIncome={handleOpenEditModal}
          onDeleteIncome={handleDelete}
        />
      </ScrollView>

      <Modal
        ref={modalRef}
        snapPoints={['80%']}
        title={
          editingIncome
            ? translate('income.edit_income')
            : translate('income.add_income')
        }
      >
        <IncomeForm
          _editingIncome={editingIncome}
          formData={formData}
          setFormData={setFormData}
          onSave={() => handleSave(formData, editingIncome)}
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

type IncomeHeaderProps = {
  totalIncome: number;
  currency: Currency;
  onAddIncome: () => void;
  colorScheme: 'light' | 'dark' | undefined;
};

function IncomeHeader({
  totalIncome,
  currency,
  onAddIncome,
  colorScheme,
}: IncomeHeaderProps) {
  return (
    <View className="bg-neutral-50 p-4 dark:bg-neutral-900">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
            {translate('income.total_income')}:{' '}
            {currencyService.formatAmount(totalIncome, currency)}
          </Text>
        </View>
        <Button onPress={onAddIncome}>
          <Plus color={colorScheme !== 'dark' ? '#ffffff' : '#000000'} />
        </Button>
      </View>
    </View>
  );
}

type IncomeListProps = {
  income: (Income & { convertedAmount: number })[];
  currency: Currency;
  onEditIncome: (income: Income) => void;
  onDeleteIncome: (income: Income) => void;
};

function IncomeList({
  income,
  currency,
  onEditIncome,
  onDeleteIncome,
}: IncomeListProps) {
  if (income.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4 pt-24">
        <Text className="mb-2 text-lg text-neutral-600 dark:text-neutral-400">
          {translate('income.no_income')}
        </Text>
        <Text className="text-center text-sm text-neutral-500 dark:text-neutral-500">
          {translate('income.add_your_first')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4">
      <View className="space-y-3">
        {income.map((incomeItem) => (
          <IncomeCard
            key={incomeItem.id}
            income={incomeItem}
            currency={currency}
            onEdit={() => onEditIncome(incomeItem)}
            onDelete={() => onDeleteIncome(incomeItem)}
          />
        ))}
      </View>
    </View>
  );
}

type IncomeFormProps = {
  _editingIncome: Income | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
};

function IncomeForm({
  _editingIncome,
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
}: IncomeFormProps) {
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
          label={translate('income.form.title')}
          value={formData.title}
          onChangeText={handleTitleChange}
          placeholder={translate('income.form.title')}
        />

        <Input
          label={translate('income.form.amount')}
          value={formData.amount}
          onChangeText={handleAmountChange}
          placeholder="0.00"
          keyboardType="numeric"
        />

        <Select
          label={translate('income.form.category')}
          value={formData.category}
          onSelect={handleCategoryChange}
          options={INCOME_CATEGORIES.map((cat) => ({
            value: cat.value,
            label: translate(cat.label),
          }))}
        />

        <Input
          label={translate('income.form.date')}
          value={formData.date}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View className="mt-6 flex-row gap-2 space-x-3">
        <Button
          onPress={onCancel}
          className="flex-1 bg-neutral-300 dark:bg-neutral-600"
        >
          <Text className="text-neutral-700 dark:text-neutral-300">
            {translate('income.form.cancel')}
          </Text>
        </Button>
        <Button
          onPress={onSave}
          className="flex-1 bg-green-500"
          disabled={isLoading}
        >
          <Text className="text-neutral-300 dark:text-neutral-700">
            {isLoading
              ? translate('income.form.saving')
              : translate('income.form.save')}
          </Text>
        </Button>
      </View>
    </View>
  );
}

type IncomeCardProps = {
  income: Income & { convertedAmount: number };
  currency: Currency;
  onEdit: () => void;
  onDelete: () => void;
};

function IncomeCard({ income, currency, onEdit, onDelete }: IncomeCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'employment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'freelance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'investment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'business':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'rental':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
            {income.title}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {income.date}
          </Text>
        </View>
        <Text className="text-xl font-bold text-green-500">
          +{currencyService.formatAmount(income.convertedAmount, currency)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-2">
          <View
            className={`rounded-full px-3 py-1 ${getCategoryColor(
              income.category
            )}`}
          >
            <Text className="text-xs font-medium">
              {getCategoryLabel(income.category)}
            </Text>
          </View>
          {income.notes && (
            <Text className="text-xs text-neutral-500 dark:text-neutral-400">
              {income.notes}
            </Text>
          )}
        </View>

        <View className="flex-row gap-2">
          <Button onPress={onEdit} variant="outline">
            <Text className="text-xs text-neutral-700 dark:text-neutral-300">
              {translate('income.actions.edit')}
            </Text>
          </Button>
          <Button onPress={onDelete} variant="outline">
            <Text className="text-xs text-neutral-700 dark:text-neutral-300">
              {translate('income.actions.delete')}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

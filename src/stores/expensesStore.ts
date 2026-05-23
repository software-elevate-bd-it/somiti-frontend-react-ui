import { create } from 'zustand';
import { apiClient, type Expense } from '@/lib/api';

interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  categories: string[];

  // Actions
  loadExpenses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  }) => Promise<void>;

  createExpense: (expenseData: {
    amount: number;
    date: string;
    category: string;
    method: string;
    note?: string;
  }) => Promise<Expense>;

  updateExpense: (id: string, expenseData: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  categories: [],

  loadExpenses: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getExpenses(params);
      console.log('Expenses API response:',response);
      const expenses = Array.isArray(response.data) ? response.data : response.data?.data || [];
      set({
        expenses,
        pagination: response.meta || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load expenses:', error);
      set({ error: 'Failed to load expenses', isLoading: false });
    }
  },

  createExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createExpense(expenseData);
      const newExpense = response.data;
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        isLoading: false,
      }));
      return newExpense;
    } catch (error) {
      console.error('Failed to create expense:', error);
      set({ error: 'Failed to create expense', isLoading: false });
      throw error;
    }
  },

  updateExpense: async (id, expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateExpense(id, expenseData);
      const updatedExpense = response.data;
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updatedExpense : e)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update expense:', error);
      set({ error: 'Failed to update expense', isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      set({ error: 'Failed to delete expense', isLoading: false });
      throw error;
    }
  },

  loadCategories: async () => {
    try {
      const response = await apiClient.getExpenseCategories();
      set({ categories: response.data });
    } catch (error) {
      console.error('Failed to load expense categories:', error);
      // Keep empty categories on error
    }
  },
}));
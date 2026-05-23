import { create } from 'zustand';
import { apiClient, Income } from '@/lib/api';

interface IncomeState {
  incomes: Income[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  types: string[];

  // Actions
  loadIncomes: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  }) => Promise<void>;

createIncome: (
incomeData: {
title:string;
type:string;
amount:number;
incomeDate:string;
source:string;
referenceNo:string;
description?:string;
note?:string;
bankAccountId:number;
status:'received'|'pending';
}) => Promise<Income>;

//   updateIncome: (id: string, incomeData: Partial<Income>) => Promise<void>;
//   deleteIncome: (id: string) => Promise<void>;
  loadTypes: () => Promise<void>;
}

export const useIncomesStore = create<IncomeState>((set, get) => ({
  incomes: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  types: [],

  loadIncomes: async (params = {}) => {

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getIncomes(params);
      console.log('Incomes API response:',response);
      const incomes = Array.isArray(response.data) ? response.data : response.data?.data || [];
      set({
        incomes,
        pagination: response.meta || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load incomes:', error);
      set({ error: 'Failed to load incomes', isLoading: false });
    }
  },

  createIncome: async (incomeData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createIncome(incomeData);
      const newIncome = response.data;
      set((state) => ({
        incomes: [newIncome, ...state.incomes],
        isLoading: false,
      }));
      return newIncome;
    } catch (error) {
      console.error('Failed to create income:', error);
      set({ error: 'Failed to create income', isLoading: false });
      throw error;
    }
  },

//   updateExpense: async (id, expenseData) => {
//     set({ isLoading: true, error: null });
//     try {
//       const response = await apiClient.updateExpense(id, expenseData);
//       const updatedExpense = response.data;
//       set((state) => ({
//         expenses: state.expenses.map((e) => (e.id === id ? updatedExpense : e)),
//         isLoading: false,
//       }));
//     } catch (error) {
//       console.error('Failed to update expense:', error);
//       set({ error: 'Failed to update expense', isLoading: false });
//       throw error;
//     }
//   },

//   deleteExpense: async (id) => {
//     set({ isLoading: true, error: null });
//     try {
//       await apiClient.deleteExpense(id);
//       set((state) => ({
//         expenses: state.expenses.filter((e) => e.id !== id),
//         isLoading: false,
//       }));
//     } catch (error) {
//       console.error('Failed to delete expense:', error);
//       set({ error: 'Failed to delete expense', isLoading: false });
//       throw error;
//     }
//   },

  loadTypes: async () => {
    try {
      const response = await apiClient.getIncomeTypes();
      set({ types: response.data });
    } catch (error) {
      console.error('Failed to load income types:', error);
      
    }
  },
}));
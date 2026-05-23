import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'collection' | 'expense';
  amount: number;
  date: string;
  category: string;
  method: 'cash' | 'bkash' | 'nagad' | 'bank' | 'sslcommerz';
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  transactionId?: string;
  receiptUrl?: string;
}

interface LedgerState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  loadLedger: (params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    memberId?: string;
  }) => Promise<void>;

  loadLedgerSummary: (params?: {
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },

  loadLedger: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getLedger(params);
      console.log('ledger response:', response);
      const transactions = Array.isArray(response.data) ? response.data : response.data?.data || [];
      set({
        transactions,
        pagination: response.meta || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load ledger:', error);
      set({ error: 'Failed to load ledger', isLoading: false });
    }
  },

  loadLedgerSummary: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getLedgerSummary(params);
      set({
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load ledger summary:', error);
      set({ error: 'Failed to load ledger summary', isLoading: false });
    }
  },
}));

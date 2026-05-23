import { create } from 'zustand';
import { apiClient } from '@/lib/api';

interface CashEntry {
  id: string;
  date: string;
  description: string;
  cashIn: number;
  cashOut: number;
  balance: number;
}

interface CashBookSummary {
  totalIn: number;
  totalOut: number;
  currentBalance: number;
}

interface CashBookState {
  entries: CashEntry[];
  summary: CashBookSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCashBook: (params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;

  loadCashBookSummary: (params?: {
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
}

export const useCashBookStore = create<CashBookState>((set) => ({
  entries: [],
  summary: null,
  isLoading: false,
  error: null,

  loadCashBook: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getCashBook(params);
      console.log('Cash book response:', response);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      // The API returns data in response.data.data
      const rawEntries = Array.isArray(response.data?.data) ? response.data.data : [];
      console.log('Raw entries:', rawEntries);
      // Map entries to match the API response structure
      const entries = rawEntries.map((entry: any) => ({
        id: entry.id || '',
        date: entry.date || '',
        description: entry.description || '',
        cashIn: Number(entry.cashIn) || 0,
        cashOut: Number(entry.cashOut) || 0,
        balance: Number(entry.balance) || 0,
      }));
      
      // Calculate totals from entries since API summary returns 0
      const totalCashIn = entries.reduce((sum, e) => sum + e.cashIn, 0);
      const totalCashOut = entries.reduce((sum, e) => sum + e.cashOut, 0);
      const summary = {
        totalIn: totalCashIn,
        totalOut: totalCashOut,
        currentBalance: totalCashIn - totalCashOut,
      };
      
      set({ entries, summary, isLoading: false });
    } catch (error) {
      console.error('Failed to load cash book:', error);
      set({ error: 'Failed to load cash book', isLoading: false });
    }
  },

  loadCashBookSummary: async (params) => {
    try {
      const response = await apiClient.getCashBookSummary(params);
      console.log('Cash book summary response:', response);
      console.log('Summary response data:', JSON.stringify(response.data, null, 2));
      // Try different data structure possibilities
      let summaryData = response.data || {};
      if (summaryData.data) {
        summaryData = summaryData.data;
      }
      console.log('Summary data after extraction:', summaryData);
      const summary = {
        totalIn: Number(summaryData.totalCashIn) || 0,
        totalOut: Number(summaryData.totalCashOut) || 0,
        currentBalance: Number(summaryData.cashInHand) || 0,
      };
      console.log('Formatted summary:', summary);
      set({ summary });
    } catch (error) {
      console.error('Failed to load cash book summary:', error);
    }
  },
}));

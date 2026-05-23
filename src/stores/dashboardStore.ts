import { create } from 'zustand';
import { apiClient, type DashboardStats } from '@/lib/api';

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadStats: () => Promise<void>;
  loadMemberStats: () => Promise<any>;

  // Reports
  getIncomeExpenseReport: (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
  }) => Promise<any>;

  getCashFlowReport: (params?: {
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<any>;

  getMemberDuesReport: (params?: {
    status?: string;
    sortBy?: string;
  }) => Promise<any>;

  getBankCashReport: () => Promise<any>;
  getCollectionReport: (params?: {
    dateFrom?: string;
    dateTo?: string;
    method?: string;
    status?: string;
  }) => Promise<any>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: {
    todayCollection: 0,
    pendingDue: 0,
    totalBankBalance: 0,
    cashInHand: 0,
    totalMembers: 0,
    activeMembers: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    pendingPayments: 0,
    recentTransactions: [],
  },
  isLoading: false,
  error: null,

  loadStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getDashboardStats();
      // console.log('Dashboard Stats Response:', response);
      // console.log('Stats data type:', typeof response.data, 'Is Array:', Array.isArray(response.data));
      const statsData = response.data;
      //console.log('Stats keys:', Object.keys(statsData));
      set({ stats: statsData || get().stats, isLoading: false });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      set({ error: 'Failed to load dashboard stats', isLoading: false });
    }
  },

  loadMemberStats: async () => {
    try {
      const response = await apiClient.getMemberDashboardStats();
      return response.data;
    } catch (error) {
      console.error('Failed to load member dashboard stats:', error);
      return {};
    }
  },

  getIncomeExpenseReport: async (params) => {
    try {
      return await apiClient.getIncomeExpenseReport(params);
    } catch (error) {
      console.error('Failed to get income expense report:', error);
      throw error;
    }
  },

  getCashFlowReport: async (params) => {
    try {
      return await apiClient.getCashFlowReport(params);
    } catch (error) {
      console.error('Failed to get cash flow report:', error);
      throw error;
    }
  },

  getMemberDuesReport: async (params) => {
    try {
      return await apiClient.getMemberDuesReport(params);
    } catch (error) {
      console.error('Failed to get member dues report:', error);
      throw error;
    }
  },

  getBankCashReport: async () => {
    try {
      return await apiClient.getBankCashReport();
    } catch (error) {
      console.error('Failed to get bank cash report:', error);
      throw error;
    }
  },

  getCollectionReport: async (params) => {
    try {
      return await apiClient.getCollectionReport(params);
    } catch (error) {
      console.error('Failed to get collection report:', error);
      throw error;
    }
  },
}));
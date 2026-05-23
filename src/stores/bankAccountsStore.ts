import { create } from 'zustand';
import { apiClient, type BankAccount } from '@/lib/api';

interface LoadingState {
  accounts: boolean;
  deposit: boolean;
  withdraw: boolean;
  transfer: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

interface BankAccountsState {
  accounts: BankAccount[];
  loading: LoadingState;
  error: string | null;

  loadAccounts: () => Promise<void>;

  createAccount: (accountData: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    openingBalance: number;
  }) => Promise<BankAccount>;

  updateAccount: (
    id: string,
    accountData: Partial<BankAccount>
  ) => Promise<void>;

  deleteAccount: (id: string) => Promise<void>;

  deposit: (
    id: string,
    depositData: {
      amount: number;
      date: string;
      note?: string;
      reference?: string;
    }
  ) => Promise<void>;

  withdraw: (
    id: string,
    withdrawData: {
      amount: number;
      date: string;
      note?: string;
    }
  ) => Promise<void>;

  transfer: (
    fromId: string,
    transferData: {
      toAccountId: string;
      amount: number;
      date: string;
      note?: string;
    }
  ) => Promise<void>;

  getTransactions: (
    id: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => Promise<any>;
}

const initialLoading: LoadingState = {
  accounts: false,
  deposit: false,
  withdraw: false,
  transfer: false,
  create: false,
  update: false,
  delete: false,
};

export const useBankAccountsStore = create<BankAccountsState>(
  (set, get) => ({
    accounts: [],
    loading: initialLoading,
    error: null,

    // =========================
    // LOAD ACCOUNTS
    // =========================
    loadAccounts: async () => {
      set((state) => ({
        loading: { ...state.loading, accounts: true },
        error: null,
      }));

      try {
        const res = await apiClient.getBankAccounts();

        console.log('Load accounts response from store:', res);
      
        const accounts = res?.data?.data ?? [];

        set((state) => ({
          accounts,
          loading: { ...state.loading, accounts: false },
        }));
      } catch (err) {
        set((state) => ({
          error: 'Failed to load bank accounts',
          loading: { ...state.loading, accounts: false },
        }));
      }
    },

    // =========================
    // CREATE
    // =========================
    createAccount: async (accountData) => {
      set((state) => ({
        loading: { ...state.loading, create: true },
        error: null,
      }));

      try {
        const res = await apiClient.createBankAccount(accountData);
        console.log('Create account response:', res);

        const newAccount = res?.data;

        if (!newAccount) throw new Error('Invalid response');

        set((state) => ({
          accounts: [...state.accounts, newAccount],
          loading: { ...state.loading, create: false },
        }));

        return newAccount;
      } catch (err) {
        set((state) => ({
          error: 'Failed to create account',
          loading: { ...state.loading, create: false },
        }));
        throw err;
      }
    },

    // =========================
    // UPDATE
    // =========================
    updateAccount: async (id, accountData) => {
      set((state) => ({
        loading: { ...state.loading, update: true },
        error: null,
      }));

      try {
        const res = await apiClient.updateBankAccount(id, accountData);
        const updated = res?.data?.data;

        if (!updated) throw new Error('Invalid response');

        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? updated : a
          ),
          loading: { ...state.loading, update: false },
        }));
      } catch (err) {
        set((state) => ({
          error: 'Failed to update account',
          loading: { ...state.loading, update: false },
        }));
        throw err;
      }
    },

    // =========================
    // DELETE
    // =========================
    deleteAccount: async (id) => {
      set((state) => ({
        loading: { ...state.loading, delete: true },
        error: null,
      }));

      try {
        await apiClient.deleteBankAccount(id);

        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          loading: { ...state.loading, delete: false },
        }));
      } catch (err) {
        set((state) => ({
          error: 'Failed to delete account',
          loading: { ...state.loading, delete: false },
        }));
        throw err;
      }
    },

    // =========================
    // DEPOSIT
    // =========================
    deposit: async (id, depositData) => {
      set((state) => ({
        loading: { ...state.loading, deposit: true },
        error: null,
      }));

      try {
        await apiClient.depositToBank(id, depositData);
        await get().loadAccounts();
      } catch (err) {
        set((state) => ({
          error: 'Failed to deposit',
        }));
        throw err;
      } finally {
        set((state) => ({
          loading: { ...state.loading, deposit: false },
        }));
      }
    },

    // =========================
    // WITHDRAW
    // =========================
    withdraw: async (id, withdrawData) => {
      set((state) => ({
        loading: { ...state.loading, withdraw: true },
        error: null,
      }));

      try {
        await apiClient.withdrawFromBank(id, withdrawData);
        await get().loadAccounts();
      } catch (err) {
        set((state) => ({
          error: 'Failed to withdraw',
        }));
        throw err;
      } finally {
        set((state) => ({
          loading: { ...state.loading, withdraw: false },
        }));
      }
    },

    // =========================
    // TRANSFER
    // =========================
    transfer: async (fromId, transferData) => {
      set((state) => ({
        loading: { ...state.loading, transfer: true },
        error: null,
      }));

      try {
        await apiClient.transferBetweenBanks(fromId, transferData);
        await get().loadAccounts();
      } catch (err) {
        set((state) => ({
          error: 'Failed to transfer',
        }));
        throw err;
      } finally {
        set((state) => ({
          loading: { ...state.loading, transfer: false },
        }));
      }
    },

    // =========================
    // TRANSACTIONS
    // =========================
    getTransactions: async (id, params) => {
      try {
        const res = await apiClient.getBankTransactions(id, params);
        return res?.data?.data ?? [];
      } catch (err) {
        console.error('Failed to get transactions:', err);
        throw err;
      }
    },
  })
);

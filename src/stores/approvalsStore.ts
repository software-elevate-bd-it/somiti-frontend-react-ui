import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, type Approval } from '@/lib/api';

export type ApprovalType = 'collection' | 'expense' | 'bank' | 'member';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  amount?: number;
  description?: string;
  payload: Record<string, any>;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionNote?: string;
}

interface ApprovalsState {
  items: ApprovalItem[];
  isLoading: boolean;
  error: string | null;
  loadApprovals: (params?: { status?: string; type?: string; page?: number; limit?: number }) => Promise<void>;
  submit: (item: Omit<ApprovalItem, 'id' | 'createdAt' | 'status'>) => Promise<ApprovalItem>;
  approve: (id: string) => Promise<void>;
  reject: (id: string, note: string) => Promise<void>;
  getApproval: (id: string) => Promise<ApprovalItem>;
  getStats: () => Promise<any>;
  pendingCount: () => number;
  pendingByType: (type: ApprovalType) => ApprovalItem[];
}

export const useApprovalsStore = create<ApprovalsState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      loadApprovals: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getApprovals(params);
          set({ items: response.data as ApprovalItem[], isLoading: false });
        } catch (error) {
          console.error('Failed to load approvals:', error);
          set({ error: 'Failed to load approvals', isLoading: false });
        }
      },

      submit: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.createApproval({
            type: item.type,
            title: item.title,
            amount: item.amount,
            description: item.description,
            payload: item.payload,
          });
          const newItem = response.data as ApprovalItem;
          set((s) => ({ items: [newItem, ...s.items], isLoading: false }));
          return newItem;
        } catch (error) {
          console.error('Failed to submit approval:', error);
          set({ error: 'Failed to submit approval', isLoading: false });
          throw error;
        }
      },

    approve: async (id) => {
  set({ isLoading: true, error: null });
  try {
    const item = get().items.find(i => i.id === id);

    if (!item) throw new Error("Approval not found");

    // 1. Call backend approval API
    const response = await apiClient.approveApproval(id);
    const updatedItem = response.data as ApprovalItem;

    // 2. 🔥 IF expense → create real expense
    if (item.type === 'expense') {
      await apiClient.createExpense({
        amount: item.payload.amount,
        date: item.payload.date,
        category: item.payload.category,
        method: item.payload.method,
        note: item.payload.note,
      });
    }

    // 3. Update local store
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? updatedItem : i)),
      isLoading: false,
    }));

  } catch (error) {
    console.error('Failed to approve:', error);
    set({ error: 'Failed to approve', isLoading: false });
    throw error;
  }
},

      reject: async (id, note) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.rejectApproval(id, note);
          const updatedItem = response.data as ApprovalItem;
          set((s) => ({
            items: s.items.map((i) => (i.id === id ? updatedItem : i)),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to reject:', error);
          set({ error: 'Failed to reject', isLoading: false });
          throw error;
        }
      },

      getApproval: async (id) => {
        try {
          const response = await apiClient.getApproval(id);
          return response.data as ApprovalItem;
        } catch (error) {
          console.error('Failed to get approval:', error);
          throw error;
        }
      },

    getStats: async () => {
  try {
    const response = await apiClient.getApprovalStats();
    return response.data;
  } catch (error) {
    console.error('Failed to get approval stats:', error);
    return {};
  }
},

pendingCount: () => {
  return get().items.filter(i => i.status === 'pending').length;
},

pendingByType: (type: ApprovalType) => {
  return get().items.filter(
    i => i.status === 'pending' && i.type === type
  );
}
    }),
    { name: 'somitee-approvals-storage' }
  )
);

import { create } from 'zustand';
import { apiClient, type Member } from '@/lib/api';

interface MembersState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  loadMembers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;

  getMember: (id: string) => Promise<Member>;
  createMember: (memberData: {
    name: string;
    shopName?: string;
    phone?: string;
    address?: string;
    nid?: string;
    monthlyFee: number;
    billingCycle?: string;
  }) => Promise<Member>;

  updateMember: (id: string, memberData: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  uploadMemberPhoto: (id: string, file: File) => Promise<string>;
  getMemberLedger: (id: string, params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
  }) => Promise<any>;

  getMemberPaymentHistory: (id: string, params?: {
    page?: number;
    limit?: number;
  }) => Promise<any>;

  getMemberDueHistory: (id: string) => Promise<any>;
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loadMembers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getMembers(params);
      set({
        members: response.data.data,
        pagination: response.data.meta || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load members:', error);
      set({ error: 'Failed to load members', isLoading: false });
    }
  },

  getMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getMember(id);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Failed to get member:', error);
      set({ error: 'Failed to get member', isLoading: false });
      throw error;
    }
  },

  createMember: async (memberData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createMember(memberData);
      const newMember = response.data;
      set((state) => ({
        members: [newMember, ...state.members],
        isLoading: false,
      }));
      return newMember;
    } catch (error) {
      console.error('Failed to create member:', error);
      set({ error: 'Failed to create member', isLoading: false });
      throw error;
    }
  },

  updateMember: async (id, memberData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateMember(id, memberData);
      const updatedMember = response.data;
      set((state) => ({
        members: state.members.map((m) => (m.id === id ? updatedMember : m)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update member:', error);
      set({ error: 'Failed to update member', isLoading: false });
      throw error;
    }
  },

  deleteMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteMember(id);
      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete member:', error);
      set({ error: 'Failed to delete member', isLoading: false });
      throw error;
    }
  },

  uploadMemberPhoto: async (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await apiClient.uploadMemberPhoto(id, formData);
      const photoUrl = response.data.photoUrl;

      // Update local state
      set((state) => ({
        members: state.members.map((m) =>
          m.id === id ? { ...m, photo: photoUrl } : m
        ),
      }));

      return photoUrl;
    } catch (error) {
      console.error('Failed to upload member photo:', error);
      throw error;
    }
  },

  getMemberLedger: async (id, params) => {
    try {
      return await apiClient.getMemberLedger(id, params);
    } catch (error) {
      console.error('Failed to get member ledger:', error);
      throw error;
    }
  },

  getMemberPaymentHistory: async (id, params) => {
    try {
      return await apiClient.getMemberPaymentHistory(id, params);
    } catch (error) {
      console.error('Failed to get member payment history:', error);
      throw error;
    }
  },

  getMemberDueHistory: async (id) => {
    try {
      return await apiClient.getMemberDueHistory(id);
    } catch (error) {
      console.error('Failed to get member due history:', error);
      throw error;
    }
  },
}));
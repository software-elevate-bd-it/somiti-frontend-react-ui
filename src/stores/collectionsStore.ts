import { create } from 'zustand';
import { apiClient, type Collection } from '@/lib/api';

interface CollectionsState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  loadCollections: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    memberId?: string;
  }) => Promise<void>;

  createCollection: (collectionData: {
    memberId: number;
    amount: number;
    date: string;
    category?: string;
    method: string;
    transactionId?: string;
    note?: string;
    financialYear?: string;
    months?: number[];
    lateFee?: number;
    discount?: number;
    totalPaid?: number;
  }) => Promise<Collection>;

  updateCollection: (id: string, collectionData: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  approveCollection: (id: string, note?: string) => Promise<void>;
  rejectCollection: (id: string, note: string) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  collections: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loadCollections: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getCollections(params);
      console.log('Collection Response:',response);
      set({
        collections: response.data.data,
        pagination: response.data.meta || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load collections:', error);
      set({ error: 'Failed to load collections', isLoading: false });
    }
  },

  createCollection: async (collectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createCollection(collectionData);
      const newCollection = response.data;
      set((state) => ({
        collections: [newCollection, ...state.collections],
        isLoading: false,
      }));
      return newCollection;
    } catch (error) {
      console.error('Failed to create collection:', error);
      set({ error: 'Failed to create collection', isLoading: false });
      throw error;
    }
  },

  updateCollection: async (id, collectionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateCollection(id, collectionData);
      const updatedCollection = response.data;
      set((state) => ({
        collections: state.collections.map((c) => (c.id === id ? updatedCollection : c)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update collection:', error);
      set({ error: 'Failed to update collection', isLoading: false });
      throw error;
    }
  },

  deleteCollection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteCollection(id);
      set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete collection:', error);
      set({ error: 'Failed to delete collection', isLoading: false });
      throw error;
    }
  },

  approveCollection: async (id, note) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.approveCollection(id, note);
      const updatedCollection = response.data;
      set((state) => ({
        collections: state.collections.map((c) => (c.id === id ? updatedCollection : c)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to approve collection:', error);
      set({ error: 'Failed to approve collection', isLoading: false });
      throw error;
    }
  },

  rejectCollection: async (id, note) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.rejectCollection(id, note);
      const updatedCollection = response.data;
      set((state) => ({
        collections: state.collections.map((c) => (c.id === id ? updatedCollection : c)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to reject collection:', error);
      set({ error: 'Failed to reject collection', isLoading: false });
      throw error;
    }
  },
}));
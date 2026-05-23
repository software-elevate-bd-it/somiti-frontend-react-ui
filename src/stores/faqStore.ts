import { create } from 'zustand';
import { apiClient, type FAQ } from '@/lib/api';

interface FAQsState {
  faqs: FAQ[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFAQs: (params?: { category?: string; search?: string }) => Promise<void>;
  createFAQ: (faqData: { question: string; answer: string; category?: string }) => Promise<void>;
  updateFAQ: (id: string, faqData: Partial<{ question: string; answer: string }>) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
}

export const useFAQsStore = create<FAQsState>((set, get) => ({
  faqs: [],
  isLoading: false,
  error: null,

  loadFAQs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getFAQs(params);
      set({
        faqs: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load FAQs',
        isLoading: false,
      });
      throw error;
    }
  },

  createFAQ: async (faqData) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.createFAQ(faqData);
      await get().loadFAQs();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create FAQ',
        isLoading: false,
      });
      throw error;
    }
  },

  updateFAQ: async (id, faqData) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.updateFAQ(id, faqData);
      await get().loadFAQs();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update FAQ',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteFAQ: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteFAQ(id);
      await get().loadFAQs();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete FAQ',
        isLoading: false,
      });
      throw error;
    }
  },
}));

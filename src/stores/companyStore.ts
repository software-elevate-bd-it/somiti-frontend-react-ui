
import { create } from 'zustand';
import { apiClient, type CompanySettings } from '@/lib/api';
import leader1 from '@/assets/leader-1.jpg';
import leader2 from '@/assets/leader-2.jpg';
import leader3 from '@/assets/leader-3.jpg';
import leader4 from '@/assets/leader-4.jpg';
import leader5 from '@/assets/leader-5.jpg';

interface CompanyState {
  company: CompanySettings;
  isLoading: boolean;
  error: string | null;
  updateCompany: (data: Partial<CompanySettings>) => Promise<void>;
  loadCompany: () => Promise<void>;
  uploadLogo: (file: File) => Promise<string>;
  uploadSignature: (file: File) => Promise<string>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: {
    name: 'মুরাদপুর ব্যবসায়ী সমবায় সমিতি লিঃ',
    logo: '',
    address: 'মুরাদপুর, চট্টগ্রাম',
    phone: '01711111111',
    email: 'info@bananimarket.com',
    signature: '',
    founders: [
      { name: 'জাবেদ রশীদ সেলিম', title: 'সভাপতি', photo: leader1 },
      { name: 'জাহেদুল আলম সুজন', title: 'সাধারণ সম্পাদক', photo: leader2 },
      { name: 'মোঃ হাসান', title: 'সাংগঠনিক সম্পাদক', photo: leader3 },
      { name: 'মোঃ ফোরকান উদ্দিন', title: 'অর্থ সম্পাদক', photo: leader4 },
      { name: 'মোঃ ইলিয়াছ', title: 'সহ সাংগঠনিক সম্পাদক', photo: leader5 },
      { name: 'মোঃ আবদুস সবুর', title: 'দপ্তর সম্পাদক', photo: leader1 },
    ],
  },
  isLoading: false,
  error: null,

  updateCompany: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateCompanySettings(data);
      set({ company: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to update company settings:', error);
      set({ error: 'Failed to update company settings', isLoading: false });
      throw error;
    }
  },

  loadCompany: async () => {
  set({ isLoading: true, error: null });

  try {
    const response = await apiClient.getCompanySettings();

    set((state) => ({
      company: {
        ...state.company, // keep existing founders
        ...response.data, // overwrite only API fields
      },
      isLoading: false,
    }));
  } catch (error) {
    console.error('Failed to load company settings:', error);

    set({
      error: 'Failed to load company settings',
      isLoading: false,
    });
  }
},

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await apiClient.uploadCompanyLogo(formData);
      const logoUrl = response.data.logoUrl;

      // Update local state
      set((state) => ({
        company: { ...state.company, logo: logoUrl }
      }));

      return logoUrl;
    } catch (error) {
      console.error('Failed to upload logo:', error);
      throw error;
    }
  },

  uploadSignature: async (file) => {
    const formData = new FormData();
    formData.append('signature', file);

    try {
      const response = await apiClient.uploadCompanySignature(formData);
      const signatureUrl = response.data.signatureUrl;

      // Update local state
      set((state) => ({
        company: { ...state.company, signature: signatureUrl }
      }));

      return signatureUrl;
    } catch (error) {
      console.error('Failed to upload signature:', error);
      throw error;
    }
  },
}));

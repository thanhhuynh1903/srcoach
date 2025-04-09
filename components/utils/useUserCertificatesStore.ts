import { create } from 'zustand';
import useApiStore from './zustandfetchAPI';
import Toast from 'react-native-toast-message';

interface Certificate {
  id: string;
  certificate_type_id: string;
  description?: string;
  status: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  CertificateType?: {
    id: string;
    type_name?: string;
    description?: string;
  };
}

interface CertificateType {
  id: string;
  type_name?: string;
  description?: string;
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

interface UserCertificatesState {
  certificates: Certificate[];
  certificateTypes: CertificateType[];
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // Certificate operations
  getSelfCertificates: () => Promise<void>;
  getUserCertificates: (userId: string) => Promise<void>;
  submitCertificates: (certificates: Omit<Certificate, 'id' | 'status' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  updateCertificateStatus: (id: string, status: string) => Promise<void>;
  getCertificateTypes: () => Promise<void>;

  // Clear state
  clearCertificates: () => void;
  clearError: () => void;
  clearMessage: () => void;
}

const showErrorToast = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
    visibilityTime: 4000,
    autoHide: true,
  });
};

const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    visibilityTime: 3000,
    autoHide: true,
  });
};

const useUserCertificatesStore = create<UserCertificatesState>((set) => ({
  certificates: [],
  certificateTypes: [],
  isLoading: false,
  error: null,
  message: null,

  getSelfCertificates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<Certificate[]>>('/user-certificates/self');

      if (response?.status) {
        set({
          certificates: response.data,
          isLoading: false,
        });
      } else {
        const errorMsg = response?.message || 'Failed to fetch certificates';
        set({ error: errorMsg, isLoading: false });
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch certificates';
      set({ error: errorMsg, isLoading: false });
      showErrorToast(errorMsg);
    }
  },

  getUserCertificates: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<Certificate[]>>(`/user-certificates/${userId}`);

      if (response?.status) {
        set({
          certificates: response.data,
          isLoading: false,
        });
      } else {
        const errorMsg = response?.message || 'Failed to fetch certificates';
        set({ error: errorMsg, isLoading: false });
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch certificates';
      set({ error: errorMsg, isLoading: false });
      showErrorToast(errorMsg);
    }
  },

  submitCertificates: async (certificates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore
        .getState()
        .patchData<ApiResponse<Certificate[]>>('/user-certificates/submit', {
          certificates,
        });

      if (response?.status) {
        set({
          certificates: response.data,
          message: 'Certificates submitted successfully',
          isLoading: false,
        });
        showSuccessToast('Certificates submitted successfully');
      } else {
        const errorMsg = response?.message || 'Failed to submit certificates';
        set({ error: errorMsg, isLoading: false });
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to submit certificates';
      set({ error: errorMsg, isLoading: false });
      showErrorToast(errorMsg);
    }
  },

  updateCertificateStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore
        .getState()
        .patchData<ApiResponse<Certificate>>(`/user-certificates/${id}/status`, {
          status,
        });

      if (response?.status) {
        set((state) => ({
          certificates: state.certificates.map((cert) =>
            cert.id === id ? { ...cert, status } : cert
          ),
          message: 'Certificate status updated successfully',
          isLoading: false,
        }));
        showSuccessToast('Certificate status updated successfully');
      } else {
        const errorMsg = response?.message || 'Failed to update certificate status';
        set({ error: errorMsg, isLoading: false });
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update certificate status';
      set({ error: errorMsg, isLoading: false });
      showErrorToast(errorMsg);
    }
  },

  getCertificateTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<CertificateType[]>>('/user-certificates/types');

      if (response?.status) {
        set({
          certificateTypes: response.data,
          isLoading: false,
        });
      } else {
        const errorMsg = response?.message || 'Failed to fetch certificate types';
        set({ error: errorMsg, isLoading: false });
        showErrorToast(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to fetch certificate types';
      set({ error: errorMsg, isLoading: false });
      showErrorToast(errorMsg);
    }
  },

  clearCertificates: () => set({ certificates: [] }),
  clearError: () => set({ error: null }),
  clearMessage: () => set({ message: null }),
}));

export default useUserCertificatesStore;
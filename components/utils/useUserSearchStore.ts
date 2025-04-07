import {create} from 'zustand';
import useApiStore from './zustandfetchAPI';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  roles: string[];
  points: number;
  user_level: string;
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface UserSearchState {
  allUsersResults: User[];
  runnersResults: User[];
  expertsResults: User[];

  isLoadingAll: boolean;
  isLoadingRunners: boolean;
  isLoadingExperts: boolean;

  errorAll: string | null;
  errorRunners: string | null;
  errorExperts: string | null;

  searchAllUsers: (query: string) => Promise<void>;
  searchRunners: (query: string) => Promise<void>;
  searchExperts: (query: string) => Promise<void>;

  clearAllResults: () => void;
  clearRunnersResults: () => void;
  clearExpertsResults: () => void;
}

const api = useApiStore.getState();

export const useUserSearchStore = create<UserSearchState>((set) => ({
  allUsersResults: [],
  runnersResults: [],
  expertsResults: [],

  isLoadingAll: false,
  isLoadingRunners: false,
  isLoadingExperts: false,

  errorAll: null,
  errorRunners: null,
  errorExperts: null,

  searchAllUsers: async (query) => {
    if (!query.trim()) {
      set({ allUsersResults: [], errorAll: 'Search query cannot be empty' });
      return;
    }

    set({ isLoadingAll: true, errorAll: null });

    try {
      const response = await api.fetchData<ApiResponse<User[]>>(
        `/users/search/users?query=${encodeURIComponent(query)}`
      );

      if (response && response.status === 'success' && Array.isArray(response.data)) {
        set({ allUsersResults: response.data, isLoadingAll: false });
      } else {
        set({
          allUsersResults: [],
          isLoadingAll: false,
          errorAll: response?.message || 'Failed to fetch users'
        });
      }
    } catch (error: any) {
      set({
        isLoadingAll: false,
        errorAll: error.message || 'Failed to search users'
      });
    }
  },

  searchRunners: async (query) => {
    if (!query.trim()) {
      set({ runnersResults: [], errorRunners: 'Search query cannot be empty' });
      return;
    }

    set({ isLoadingRunners: true, errorRunners: null });

    try {
      const response = await api.fetchData<ApiResponse<User[]>>(
        `/users/search/runners?query=${encodeURIComponent(query)}`
      );

      if (response && response.status === 'success' && Array.isArray(response.data)) {
        set({ runnersResults: response.data, isLoadingRunners: false });
      } else {
        set({
          runnersResults: [],
          isLoadingRunners: false,
          errorRunners: response?.message || 'Failed to fetch runners'
        });
      }
    } catch (error: any) {
      set({
        isLoadingRunners: false,
        errorRunners: error.message || 'Failed to search runners'
      });
    }
  },

  searchExperts: async (query) => {
    if (!query.trim()) {
      set({ expertsResults: [], errorExperts: 'Search query cannot be empty' });
      return;
    }

    set({ isLoadingExperts: true, errorExperts: null });

    try {
      const response = await api.fetchData<ApiResponse<User[]>>(
        `/users/search/experts?query=${encodeURIComponent(query)}`
      );

      if (response && response.status === 'success' && Array.isArray(response.data)) {
        set({ expertsResults: response.data, isLoadingExperts: false });
      } else {
        set({
          expertsResults: [],
          isLoadingExperts: false,
          errorExperts: response?.message || 'Failed to fetch experts'
        });
      }
    } catch (error: any) {
      set({
        isLoadingExperts: false,
        errorExperts: error.message || 'Failed to search experts'
      });
    }
  },

  clearAllResults: () => set({ allUsersResults: [], errorAll: null }),
  clearRunnersResults: () => set({ runnersResults: [], errorRunners: null }),
  clearExpertsResults: () => set({ expertsResults: [], errorExperts: null }),
}));

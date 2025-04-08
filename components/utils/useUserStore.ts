import {create} from 'zustand';
import useApiStore from './zustandfetchAPI';

interface User {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  birth_date?: string;
  gender?: string;
  address1?: string;
  address2?: string;
  zip_code?: string;
  phone_number?: string;
  phone_code?: string;
  is_active?: boolean;
  points?: number;
  user_level?: string;
  roles?: string[];
  stats?: {
    total_posts?: number;
    total_comments?: number;
    total_comments_received?: number;
    total_likes_received?: number;
    total_dislikes_received?: number;
    total_chat_sessions?: number;
    total_active_chat_sessions?: number;
  };
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface UserState {
  currentUser: User | null;
  viewedUser: User | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // User operations
  login: (identifier: string, password: string) => Promise<void>;
  refreshToken: (refreshToken: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  getUserById: (id: string) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Account management
  createUser: (userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
    birthDate?: string;
    gender?: string;
    address1?: string;
    address2?: string;
    zipCode?: string;
    phoneCode?: string;
    phoneNumber?: string;
  }) => Promise<void>;

  activateAccount: (email: string, verificationCode: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (
    email: string,
    verificationCode: string,
  ) => Promise<void>;
  resetPasswordConfirmed: (email: string, newPassword: string) => Promise<void>;

  // Points system
  getUserPoints: (id: string) => Promise<{points: number; user_level: string}>;

  // Search functionality
  searchUsers: (query: string) => Promise<User[]>;
  searchRunners: (query: string) => Promise<User[]>;
  searchExperts: (query: string) => Promise<User[]>;

  // Clear state
  clearCurrentUser: () => void;
  clearViewedUser: () => void;
  clearError: () => void;
  clearMessage: () => void;
}

const useUserStore = create<UserState>(set => ({
  currentUser: null,
  viewedUser: null,
  isLoading: false,
  error: null,
  message: null,

  login: async (identifier, password) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/users/login', {
        identifier,
        password,
      });

      if (response?.status === 'success') {
        set({
          currentUser: response.data.user,
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Login failed',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
    }
  },

  refreshToken: async refreshToken => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users/refresh-token', {
          refreshToken,
        });

      if (response?.status === 'success') {
        set({isLoading: false});
      } else {
        set({
          error: response?.message || 'Token refresh failed',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Token refresh failed',
        isLoading: false,
      });
    }
  },

  getCurrentUser: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<User>>('/users/me');

      if (response?.status === 'success') {
        set({
          currentUser: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch current user',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch current user',
        isLoading: false,
      });
    }
  },

  getUserById: async id => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<User>>(`/users/${id}`);

      if (response?.status === 'success') {
        set({
          viewedUser: response.data,
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch user',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch user',
        isLoading: false,
      });
    }
  },

  updateUser: async (id, userData) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .putData(`/users/${id}`, userData);

      if (response?.status === 'success') {
        set({
          currentUser: response.data,
          message: 'User updated successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to update user',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update user',
        isLoading: false,
      });
    }
  },

  deleteUser: async id => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().deleteData(`/users/${id}`);

      if (response?.status === 'success') {
        set({
          currentUser: null,
          message: 'User deleted successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to delete user',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete user',
        isLoading: false,
      });
    }
  },

  createUser: async userData => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users', userData);

      if (response?.status === 'success') {
        set({
          message:
            'User created successfully. Please check your email for verification.',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to create user',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create user',
        isLoading: false,
      });
    }
  },

  activateAccount: async (email, verificationCode) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users/activate', {
          email,
          verificationCode,
        });

      if (response?.status === 'success') {
        set({
          message: 'Account activated successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to activate account',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to activate account',
        isLoading: false,
      });
    }
  },

  resendVerificationCode: async email => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users/resend-code', {
          email,
        });

      if (response?.status === 'success') {
        set({
          message: 'Verification code resent successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to resend verification code',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to resend verification code',
        isLoading: false,
      });
    }
  },

  resetPassword: async email => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users/send-code-reset', {
          email,
        });

      if (response?.status === 'success') {
        set({
          message: 'Password reset code sent successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to send reset code',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to send reset code',
        isLoading: false,
      });
    }
  },

  confirmResetPassword: async (email, verificationCode) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users/confirmed-code-verify', {
          email,
          verificationCode,
        });

      if (response?.status === 'success') {
        set({
          message: 'Verification code confirmed successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to confirm verification code',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to confirm verification code',
        isLoading: false,
      });
    }
  },

  resetPasswordConfirmed: async (email, newPassword) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/users/reset-password-confirmed', {
          email,
          newPassword,
        });

      if (response?.status === 'success') {
        set({
          message: 'Password reset successfully',
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to reset password',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to reset password',
        isLoading: false,
      });
    }
  },

  getUserPoints: async id => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<{points: number; user_level: string}>>(
          `/users/${id}/points`,
        );

      if (response?.status === 'success') {
        set({isLoading: false});
        return response.data;
      } else {
        set({
          error: response?.message || 'Failed to fetch user points',
          isLoading: false,
        });
        return {points: 0, user_level: 'Unknown'};
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch user points',
        isLoading: false,
      });
      return {points: 0, user_level: 'Unknown'};
    }
  },

  searchUsers: async query => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<User[]>>(
          `/users/search/users?query=${encodeURIComponent(query)}`,
        );

      if (response?.status === 'success') {
        set({isLoading: false});
        return response.data;
      } else {
        set({
          error: response?.message || 'Failed to search users',
          isLoading: false,
        });
        return [];
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search users',
        isLoading: false,
      });
      return [];
    }
  },

  searchRunners: async query => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<User[]>>(
          `/users/search/runners?query=${encodeURIComponent(query)}`,
        );

      if (response?.status === 'success') {
        set({isLoading: false});
        return response.data;
      } else {
        set({
          error: response?.message || 'Failed to search runners',
          isLoading: false,
        });
        return [];
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search runners',
        isLoading: false,
      });
      return [];
    }
  },

  searchExperts: async query => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<User[]>>(
          `/users/search/experts?query=${encodeURIComponent(query)}`,
        );

      if (response?.status === 'success') {
        set({isLoading: false});
        return response.data;
      } else {
        set({
          error: response?.message || 'Failed to search experts',
          isLoading: false,
        });
        return [];
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search experts',
        isLoading: false,
      });
      return [];
    }
  },

  clearCurrentUser: () => set({currentUser: null}),
  clearViewedUser: () => set({viewedUser: null}),
  clearError: () => set({error: null}),
  clearMessage: () => set({message: null}),
}));

export default useUserStore;

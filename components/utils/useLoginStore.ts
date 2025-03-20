import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface LoginState {
  accessToken: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  login: (email: string, password: string) => Promise<void>;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  accessToken: null,
  status: 'idle',
  message: '',
  login: async (email: string, password: string) => {
    console.log("email", email);
    console.log("password", password);
    
    set({ status: 'loading', message: '' });
    try {
      const response = await axios.post(
        'https://xavia.pro/api/users/login',
        { identifier :email, password },
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );
      console.log("response", response.data);
      
      // Kiểm tra xem API trả về key nào chứa token (ví dụ accessToken hoặc token)
      const { accessToken } = response.data;
      AsyncStorage.setItem('authToken', response?.data?.accessToken);
      console.log("accessToken", accessToken);
      console.log('Token mounted',AsyncStorage.getItem('authToken'));

      set({ accessToken, status: 'success', message: 'Login Successfully' });
    } catch (error: any) {
      set({
        status: 'error',
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      });
    }
  },

  setAccessToken: (token: string | null) => set({ accessToken: token }),

  clear: () => set({ accessToken: null, status: 'idle', message: '' }),
}));

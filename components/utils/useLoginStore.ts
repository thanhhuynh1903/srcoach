import {create} from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginState {
  userdata: any | null;
  apiStatus: any;
  resendStatus: any;
  status: any;
  message: string;
  login: (email: string, password: string) => Promise<void>;
  clear: () => void;
  verifyCode: (code: string) => Promise<void>;
  ResendCode: () => Promise<void>;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  userdata: null,
  status:"",
  resendStatus: "",
  apiStatus: false,
  message: '',
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(
        'https://xavia.pro/api/users/login',
        {identifier: email, password},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('response', response.data);
      const apiStatus = response?.data?.status;
      const message = response?.data?.message;
      const userdata = response?.data?.user;


      AsyncStorage.setItem('authToken', response?.data?.data?.accessToken);
      set({userdata, status: apiStatus, message});
    } catch (error: any) {
      set({
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      });
    }
  },
  verifyCode: async (code: string) => {
    // Lấy email từ dataUser trong state
    const {userdata} = get();
    console.log('dataUser', userdata);

    if (!userdata || !userdata?.email) {
      console.log('No email available from dataUser');
      return;
    }

    try {
      const response = await axios.post(
        'https://xavia.pro/api/users/activate',
        {
          email: userdata?.email, // Lấy email từ dataUser
          verificationCode: code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Response:', response.data);
      console.log('Verify Success', response.data.status);

      set({status: response.data.status, message: response.data.message});
    } catch (error: any) {
      console.log('Error:', error);
      // Xử lý lỗi nếu cần
    }
  },
  ResendCode: async () => {
    // Lấy email từ dataUser trong state
    const {userdata} = get();
    console.log('Resend code user data', userdata);

    set({resendStatus: 'loading', message: ''});
    if (!userdata || !userdata.email) {
      console.log('No email available from dataUser');
      return;
    }

    try {
      const response = await axios.post(
        'https://xavia.pro/api/users/resend-code',
        {
          email: userdata?.email, // Lấy email từ dataUser
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Response:', response.data);
      console.log('Verify Success', response.data.status);

      set({resendStatus: response.data.status, message: response.data.message});
    } catch (error: any) {
      console.log('Error:', error);
      // Xử lý lỗi nếu cần
    }
  },
  clear: () => set({userdata: null, status: null, message: ''}),
}));

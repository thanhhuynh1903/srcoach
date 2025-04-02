import {create} from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginState {
  userdata: any | null;
  profile: any | null;
  apiStatus: any;
  resendStatus: any;
  status: any;
  message: string;
  login: (email: string, password: string) => Promise<void>;
  clear: () => void;
  clearAll: () => Promise<void>;
  verifyCode: (email: string,code: string) => Promise<void>;
  ResendCode: (email:string) => Promise<void>;
  setUserData: (data: any) => void;

}
const MASTER_URL = "https://xavia.pro/api";

export const useLoginStore = create<LoginState>((set, get) => ({
  userdata: null,
  profile: null,
  status:"",
  resendStatus: "",
  apiStatus: '',
  message: '',
  setUserData: (data: any) => set({ userdata: data }),
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/login`,
        {identifier: email, password},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log("Identified")

      console.log('response', response.data);
      if (response.data.status === 'error') {
        set({
          status: response.data.status,
          message: response.data.message,
        });
        return;
      }
      const { accessToken, user } = response?.data?.data;
      await AsyncStorage.setItem('authToken', accessToken);
      await AsyncStorage.setItem('userdata', JSON.stringify(user));
      await AsyncStorage.setItem('authTokenTimestamp', Date.now().toString());

      console.log('User data:', user);
      console.log('Token when login:', accessToken);

      set({userdata : user, profile: response?.data?.data?.user ,status: response?.data?.status, message : response?.data?.message});
    } catch (error: any) {
      set({
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      });
    }
  },
  verifyCode: async (email: string,code: string) => {
    // Lấy email từ dataUser trong state
    console.log('email', email);
    set({status: 'loading', message: ''});

    try {
      const response = await axios.post(
        `${MASTER_URL}/users/activate`,
        {
          email: email, // Lấy email từ dataUser
          verificationCode: code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Response:', response.data);
      console.log('Verify status', response.data.status);

      set({status: response.data.status, message: response.data.message});
    } catch (error: any) {
      console.log('Error:', error);
      // Xử lý lỗi nếu cần
    }
  },
  ResendCode: async (email:string) => {
    // Lấy email từ dataUser trong state
    // const {userdata} = get();
    // console.log('Resend code user data', userdata);

    set({resendStatus: 'loading', message: ''});
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/resend-code`,
        {
          email: email,
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
  clear: () => set({userdata: null, status: '', message: ''}),
  clearAll: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userdata');
    await AsyncStorage.removeItem('authTokenTimestamp');
    set({userdata: null, profile: null ,status: '', message: ''});
  },
}));

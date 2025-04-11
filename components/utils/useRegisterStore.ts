import { create } from 'zustand';
import axios from 'axios';

interface RegisterState {
  dataUser: any | null;
  status: any;
  verifyStatus: any;
  resendStatus: any;
  message: string;
  register: (
    name: string,
    usname: string,
    gender: string,
    dob: string,
    email: string,
    password: string,
  ) => Promise<void>;
  clear: () => void;
  verifyCode: (email: string, code: string) => Promise<void>;
  ResendCode: (email: string) => Promise<void>;
}
const MASTER_URL = "http://192.168.1.11:5000/api";

export const useRegisterStore = create<RegisterState>((set, get) => ({
  dataUser: null,
  status: '',
  verifyStatus: '',
  resendStatus: '',
  message: '',

  register: async (name, username, gender, dob, email, password) => {
    console.log('name', name);
    console.log('username', username);
    console.log('gender', gender);
    console.log('dob', dob);
    console.log('email', email);
    console.log('password', password);

    try {
      const response = await axios.post(
        `${MASTER_URL}/users`,
        {
          username: username,
          email: email,
          password: password,
          name: name,
          birthDate: dob,
          gender: gender,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('response', response.data);
      const dataUser = response?.data?.data;
      set({
        dataUser,
        status: response?.data?.status,
        message: response?.data?.message,
      });
    } catch (error: any) {
      console.log('Error:', error);
      set({
        status: 'error',
        message: error.response?.data?.message || 'Registration Failed',
      });
    }
  },

  // Updated clear function to reset all statuses including verifyStatus and resendStatus
  clear: () =>
    set({
      status: 'idle',
      verifyStatus: 'idle',
      resendStatus: 'idle',
      message: '',
    }),

  verifyCode: async (email: string, code: string) => {
    console.log('email', email);
    set({ status: 'loading', message: '' });

    try {
      const response = await axios.post(
        `${MASTER_URL}/users/activate`,
        {
          email: email,
          verificationCode: code,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Response:', response.data);
      set({ verifyStatus: response.data.status, message: response.data.message });
    } catch (error: any) {
      console.log('Error:', error);
      set({
        verifyStatus: 'error',
        message: error.response?.data?.message || 'Verification Failed',
      });
    }
  },

  ResendCode: async (email: string) => {
    console.log('email', email);
    set({ resendStatus: 'loading', message: '' });

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
      set({ resendStatus: response.data.status, message: response.data.message });
    } catch (error: any) {
      console.log('Error:', error);
      set({
        resendStatus: 'error',
        message: error.response?.data?.message || 'Resend Failed',
      });
    }
  },
}));

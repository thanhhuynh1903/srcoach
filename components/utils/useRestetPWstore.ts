import { create } from 'zustand';
import axios from 'axios';

const MASTER_URL = 'https://xavia.pro/api';

interface ResetPasswordState {
  userdata: any | null;
  status: string;
  verifyStatus: any;
  resendStatus: string;
  apiStatus: string;
  message: string;
  emailForReset: string | null;  // store the email used for reset
  ResetPassword: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  ResendPassword: (email: string) => Promise<void>;
  clear: () => void;
}

export const useRestetPWstore = create<ResetPasswordState>((set, get) => ({
  userdata: null,
  status: '',
  resendStatus: '',
  apiStatus: '',
  message: '',
  verifyStatus: '',
  emailForReset: null,

  // 1) REQUEST A PASSWORD RESET EMAIL
  ResetPassword: async (email: string) => {
    // Start loading & clear old messages
    console.log('Resetting password for email:', email);
    
    set({ status: 'loading', message: '', emailForReset: email });
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/reset-password`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('response', response.data);

      const apiStatus = response.data?.status;      
      const message = response.data?.message;
      const userdata = response.data?.user || null;

      set({
        userdata,
        status: apiStatus,   // e.g. "success"
        message: message || '',
      });
    } catch (error: any) {
      console.log('ResetPassword error:', error);
      set({
        status: 'error',
        message: error.response?.data?.message || 'Password reset failed',
      });
    }
  },

  // 2) VERIFY THE CODE FROM THE EMAIL
  verifyCode: async (email: string, code: string) => {
    console.log('Verifying code for email:', email);
    set({ status: 'loading', message: '' });

    try {
      const response = await axios.post(
        `${MASTER_URL}/users/activate`, // Adjust if your endpoint is different for reset
        {
          email,
          verificationCode: code,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Response:', response.data);

      set({
        status: response.data?.status || 'error',
        message: response.data?.message || '',
      });
    } catch (error: any) {
      console.log('Verify code error:', error);
      set({
        status: 'error',
        message: error.response?.data?.message || 'Verification failed',
      });
    }
  },

  // 3) RESEND THE CODE IF NEEDED
  ResendPassword: async (email: string) => {
    // Start loading & clear old messages
    console.log('Resetting password for email:', email);
    
    set({ resendStatus: 'loading', message: '', emailForReset: email });
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/reset-password`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('response', response.data);

      const apiStatus = response.data?.status;      
      const message = response.data?.message;
      const userdata = response.data?.user || null;

      set({
        userdata,
        resendStatus: apiStatus,   // e.g. "success"
        message: message || '',
      });
    } catch (error: any) {
      console.log('ResetPassword error:', error);
      set({
        status: 'error',
        message: error.response?.data?.message || 'Password reset failed',
      });
    }
  },


  // 4) CLEAR THE STORE
  clear: () => set({
    userdata: null,
    status: '',
    verifyStatus: '',
    message: '',
    resendStatus: '',
    apiStatus: '',
    emailForReset: null,
  }),
}));

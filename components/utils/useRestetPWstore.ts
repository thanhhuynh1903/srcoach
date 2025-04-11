import {create} from 'zustand';
import axios from 'axios';

const MASTER_URL = 'https://xavia.pro/api';

interface ResetPasswordState {
  userdata: any | null;
  status: string;
  verifyStatus: any;
  resendStatus: string;
  apiStatus: string;
  message: string;
  emailForReset: string | null; // store the email used for reset

  // Các hàm bạn đã có
  ResetPassword: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  clear: () => void;

  // Thêm hàm xác nhận đặt mật khẩu mới (BƯỚC 3)
  confirmResetPassword: (
    email: string,
    newPassword: string,
  ) => Promise<void>;
}

export const useRestetPWstore = create<ResetPasswordState>((set, get) => ({
  userdata: null,
  status: '',
  resendStatus: '',
  apiStatus: '',
  message: '',
  verifyStatus: '',
  emailForReset: null,

  // (1) Gửi email reset
  ResetPassword: async (email: string) => {
    set({status: 'loading', message: ''});
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/send-code-reset`,
        {email},
        {headers: {'Content-Type': 'application/json'}},
      );

      const apiStatus = response.data?.status;
      const message = response.data?.message;
      const userdata = response.data?.user || null;
      
      set({
        userdata,
        status: apiStatus, // e.g. "success"
        message: message,
      });
    } catch (error: any) {
      set({
        status: 'error',
        message: error.response?.data?.message || 'Password reset failed',
      });
    }
  },

  // (2) Xác thực mã reset
  verifyCode: async (email: string, code: string) => {
    set({status: 'loading', message: ''});
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/confirmed-code-verify`,
        {email, verificationCode: code},
        {headers: {'Content-Type': 'application/json'}},
      );
      set({
        verifyStatus: response.data?.status || 'error',
        message: response.data?.message || '',
      });
    } catch (error: any) {
      set({
        verifyStatus: 'error',
        message: error.response?.data?.message || 'Verification failed',
      });
    }
  },

  // (3) Đổi mật khẩu mới sau khi mã đã được xác thực
  confirmResetPassword: async (email: string, newPassword: string) => {
    set({status: 'loading', message: ''});
    console.log('newPassword', newPassword);
    console.log('email in new pw', email);
    
    try {
      const response = await axios.post(
        `${MASTER_URL}/users/reset-password-confirmed`,
        {email : email, newPassword},
        {headers: {'Content-Type': 'application/json'}},
      );
      
      const apiStatus = response.data?.status;
      const message = response.data?.message || '';
      console.log('Response:', apiStatus);

      set({
        status: apiStatus,
        message: message,
      });
    } catch (error: any) {
      set({
        status: 'error',
        message:
          error.response?.data?.message || 'Reset password confirm failed',
      });
  
    }
  },

  // (4) Xoá dữ liệu trong store
  clear: () =>
    set({
      userdata: null,
      status: '',
      verifyStatus: '',
      message: '',
      resendStatus: '',
      apiStatus: '',
    }),
}));

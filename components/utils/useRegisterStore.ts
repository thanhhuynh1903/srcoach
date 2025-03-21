import {create} from 'zustand';
import axios from 'axios';

interface RegisterState {
  dataUser: any | null;
  status: any;
  verifyStatus: any;
  message: string;
  register: (
    name: string,
    usname: string,
    age: number,
    email: string,
    password: string,
  ) => Promise<void>;
  clear: () => void;
  verifyCode: (code: string) => Promise<void>;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  dataUser: null,
  status: '',
  verifyStatus: '',
  message: '',
  register: async (name, username, age, email, password) => {

    try {
      const response = await axios.post(
        'https://xavia.pro/api/users',
        {
          username: username,
          email: email,
          password: password,
          name: name,
          age: age,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('response', response.data);
      console.log('response?.data?.data', response?.data?.data);
      const dataUser = response?.data?.data;
      set({dataUser, status: response?.data?.status , message: response?.data?.message});
    } catch (error: any) {
      console.log('Error:', error);
      set({
        status: 'error',
        message: error.response?.data?.message || 'Registration Failed',
      });
    }
  },
  clear: () => set({status: 'idle', message: ''}),
  verifyCode: async (code: string) => {
    // Lấy email từ dataUser trong state
    const {dataUser} = get();
    console.log('dataUser', dataUser);

    set({verifyStatus: 'loading', message: ''});
    if (!dataUser || !dataUser.email) {
      console.log('No email available from dataUser');
      return;
    }

    try {
      const response = await axios.post(
        'https://xavia.pro/api/users/activate',
        {
          email: dataUser?.email, // Lấy email từ dataUser
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

      set({verifyStatus: response.data.status, message: response.data.message});
    } catch (error: any) {
      console.log('Error:', error);
      // Xử lý lỗi nếu cần
    }
  },
}));

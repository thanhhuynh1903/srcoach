import { create } from "zustand";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import useAuthStore from "./useAuthStore";
import Config from 'react-native-config';

export const MASTER_URL = Config.ENV_MASTER_URL || Config.ENV_MASTER_URL_2;

// Interface cho state của API store
interface ApiState {
  data: any | null;
  dataDetail: any | null;
  isLoading: boolean;
  status: string | null;
  
  setLoading: () => void;
  setError: (error?: string | null) => void;
  setData: (data?: any | null) => void;
  setDataDetail: (dataDetail?: any | null) => void;
  
  fetchData: <T>(path: string) => Promise<T | null>;
  fetchDataDetail: <T>(path: string) => Promise<T | null>;
  postData: (path: string, payload: any) => Promise<void>;
  putData: (path: string, payload: any) => Promise<void>;

  postFileData: (path: string, selectedFile: File, dataObject: Record<string, any>) => Promise<void>;
  updateData: (path: string, payload: any) => Promise<void>;
  patchData: (path: string, payload: any) => Promise<void>;
  deleteData: (path: string) => Promise<any>;
  fetchStepCount: (token: string) => Promise<void>;
  clear: () => void;
}

// Cấu hình cho Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: MASTER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

const useApiStore = create<ApiState>((set) => ({
  data: null,
  dataDetail: null,
  isLoading: false,
  status: null,

  setLoading: () => set({ isLoading: true, status: null }),
  setError: (status = null) => set({ status, isLoading: false }),
  setData: (data = null) => set({ data, isLoading: false }),
  setDataDetail: (dataDetail = null) => set({ dataDetail, isLoading: false }),

  fetchData: async <T>(path: string): Promise<T | null> => {
    set({ isLoading: true, status: null });
    try {
      const response: AxiosResponse = await axiosInstance.get(path);
      set({ isLoading: false });
      return response.data as T;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ isLoading: false, status: errorMessage });
      return null;
    }
  },
  fetchDataDetail: async <T>(path: string): Promise<T | null> => {
    set({ isLoading: true, status: null });
    try {
      const response: AxiosResponse = await axiosInstance.get(path);
      set({ isLoading: false });
      return response.data as T;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ isLoading: false, status: errorMessage });
      return null;
    }
  },
  
  postData: async (path: string, payload: any) => {
    set({ isLoading: true, status: null });
    try {
      let headers = {};
      
      // Kiểm tra nếu payload là FormData
      if (payload instanceof FormData) {
        console.log('1');
        
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        headers = { 'Content-Type': 'application/json' };
        payload = JSON.stringify(payload);
      }
      
      const response: AxiosResponse = await axiosInstance.post(path, payload, { headers });
      console.log('response', response.data); 
      
      set({ data: response.data.data, isLoading: false, status: response.data.status });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ data: null, isLoading: false, status: errorMessage });
      throw error;
    }
  },
  

  putData: async (path: string, payload: any) => {
    set({ isLoading: true, status: null });
    try {
      let headers = {};
      
      // Kiểm tra nếu payload là FormData
      if (payload instanceof FormData) {
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        headers = { 'Content-Type': 'application/json' };
        payload = JSON.stringify(payload);
      }
      console.log('payload', payload);
      
      const response: AxiosResponse = await axiosInstance.put(path, payload, { headers });
      console.log('response put', response.data); 
      
      set({ 
        data: response.data.data, 
        isLoading: false, 
        status: response.data.status,
        message: response.data.message 
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ data: null, isLoading: false, status: errorMessage });
      throw error;
    }
  },


  postFileData: async (path: string, selectedFile: File, dataObject: Record<string, any>) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    const formData: FormData = new FormData();
    Object.entries(dataObject).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response: AxiosResponse = await axiosInstance.post(path, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ data: response.data, isLoading: false, status: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, status: error.message });
    }
  },

  updateData: async (path: string, payload: any) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.put(path, payload);
      set({ data: response.data, isLoading: false, status: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, status: error.message });
    }
  },

  patchData: async (path: string, payload: any) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.patch(path, payload);
      set({ data: response.data, isLoading: false, status: null });
      return response.data;
    } catch (error: any) {
      set({ data: null, isLoading: false, status: error.message });
      return null;
    }
  },

  deleteData: async (path: string) => {
    set({ isLoading: true, status: null });
    try {
      const response: AxiosResponse = await axiosInstance.delete(path);
      set({ 
        data: response.data.data, 
        isLoading: false, 
        status: response.data.status 
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      set({ data: null, isLoading: false, status: errorMessage });
      throw error;
    }
  },

  fetchStepCount: async (token: string) => {
    try {
      const response: AxiosResponse = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: Date.now() - 7 * 86400000,
          endTimeMillis: Date.now(),
        },
      });
      set({ data: response.data, isLoading: false, status: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, status: error.message });
    }
  },
  clear: () => set({ data: null, dataDetail: null ,isLoading: false, status: null }),
}));

export default useApiStore;

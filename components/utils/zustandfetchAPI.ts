import { create } from "zustand";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import useAuthStore from "./useAuthStore";

const MASTER_URL = "https://xavia.pro/api";

const token = useAuthStore.getState().token;
console.log("Token at API:", token);

// Interface cho state của API store
interface ApiState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
  
  setLoading: () => void;
  setError: (error?: string | null) => void;
  setData: (data?: any | null) => void;
  
  fetchData: (path: string) => Promise<void>;
  postData: (path: string, payload: any) => Promise<void>;
  postFileData: (path: string, selectedFile: File, dataObject: Record<string, any>) => Promise<void>;
  updateData: (path: string, payload: any) => Promise<void>;
  patchData: (path: string, payload: any) => Promise<void>;
  deleteData: (path: string) => Promise<any>;
  fetchStepCount: (token: string) => Promise<void>;
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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

const useApiStore = create<ApiState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  setLoading: () => set({ isLoading: true, error: null }),
  setError: (error = null) => set({ error, isLoading: false }),
  setData: (data = null) => set({ data, isLoading: false }),

  fetchData: async (path: string) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.get(path);

      console.log("response", response.data);
      
      set({ data: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
    }
  },

  postData: async (path: string, payload: any) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.post(path, payload);
      set({ data: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
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
      set({ data: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
    }
  },

  updateData: async (path: string, payload: any) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.put(path, payload);
      set({ data: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
    }
  },

  patchData: async (path: string, payload: any) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.patch(path, payload);
      set({ data: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
    }
  },

  deleteData: async (path: string) => {
    set((state) => ({ ...state, isLoading: true, error: null }));
    try {
      const response: AxiosResponse = await axiosInstance.delete(path);
      set({ data: null, isLoading: false, error: null });
      return response.data;
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
      return null;
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
      set({ data: response.data, isLoading: false, error: null });
    } catch (error: any) {
      set({ data: null, isLoading: false, error: error.message });
    }
  },
}));

export default useApiStore;

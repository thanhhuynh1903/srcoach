import { create } from "zustand";
import axios from "axios";
import useAuthStore from "./useAuthStore";

const MASTER_URL = "https://xavia.pro/api";
const { loadToken } = useAuthStore();

const axiosInstance = axios.create({
  baseURL: MASTER_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = loadToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const useApiStore = create((set) => ({
  data: null,
  isLoading: false,
  error: null,

  setLoading: () => set({ isLoading: true, error: null }),
  setError: (error = null) => set({ error, isLoading: false }),
  setData: (data = null) => set({ data, isLoading: false }),

  fetchData: async (path: string) => {
    set((state: any) => state.setLoading());
    try {
      const response = await axiosInstance.get(path);
      set((state: any) => state.setData(response.data));
    } catch (error: any) {
      set((state: any) => state.setError(error.message));
    }
  },

  postData: async (path: string, payload: string) => {
    set((state: any) => state.setLoading());
    try {
      const response = await axiosInstance.post(path, payload);
      set((state: any) => state.setData(response.data));
    } catch (error: any) {
      set((state: any) => state.setError(error.message));
    }
  },

  postFileData: async (path: string, selectedFile: File, dataObject: any) => {
    set((state: any) => state.setLoading());
    const formData: any = new FormData();
    Object.entries(dataObject).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await axiosInstance.post(path, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state: any) => state.setData(response.data));
    } catch (error: any) {
      set((state: any) => state.setError(error.message));
    }
  },

  updateData: async (path: string, payload: string) => {
    set((state: any) => state.setLoading());
    try {
      const response = await axiosInstance.put(path, payload);
      set((state: any) => state.setData(response.data));
    } catch (error: any) {
      set((state: any) => state.setError(error.message));
    }
  },

  patchData: async (path: string, payload: string) => {
    set((state: any) => state.setLoading());
    try {
      const response = await axiosInstance.patch(path, payload);
      set((state: any) => state.setData(response.data));
    } catch (error: any) {
      set((state: any) => state.setError(error.message));
    }
  },

  deleteData: async (path: string) => {
    set((state: any) => state.setLoading());
    try {
      const response = await axiosInstance.delete(path);
      set({ data: null, isLoading: false });
      return response.data;
    } catch (error: any) {
      set((state: any) => state.setError(error.message));
    }
  },

  fetchStepCount: async (token: string) => {
    const response = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: Date.now() - 7 * 86400000,
        endTimeMillis: Date.now(),
      },
    });
  },
}));

export default useApiStore;
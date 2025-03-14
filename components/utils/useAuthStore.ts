import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Define the state shape
interface AuthState {
  token: string | null;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  loadToken: () => Promise<void>;
}

// Create the Zustand store
const useAuthStore = create<AuthState>((set) => ({
  token: null,

  setToken: async (token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      set({ token });
      console.log('Token saved successfully');
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  },

  clearToken: async () => {
    try {
      await AsyncStorage.clear();
      set({ token: null });
      console.log('Token cleared successfully');
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  },

  loadToken: async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      set({ token: storedToken });
      console.log('Token loaded:', storedToken);
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }
}));

export default useAuthStore;

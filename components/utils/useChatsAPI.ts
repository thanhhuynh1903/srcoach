import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_URL } from './zustandfetchAPI';
import ToastUtil from './utils_toast';

// Axios instance
const api = axios.create({
  baseURL: MASTER_URL,
});

// Request interceptor for auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    ToastUtil.error('Error', errorMessage);
    return Promise.reject(error);
  }
);

export const searchUsers = async (query: string): Promise<any> => {
  try {
    const response = await api.get(`/users/search/users?query=${encodeURIComponent(query)}`);
    if (!response.data.status) {
      ToastUtil.error('Search Failed', response.data.message);
    }
    return response.data;
  } catch (error) {
    ToastUtil.error('Search Error', 'Failed to search users');
    return { status: false, message: 'Failed to search users', data: null };
  }
};

export const searchExperts = async (query: string): Promise<any> => {
  try {
    const response = await api.get(`/users/search/experts?query=${encodeURIComponent(query)}`);
    if (!response.data.status) {
      ToastUtil.error('Search Failed', response.data.message);
    }
    return response.data;
  } catch (error) {
    ToastUtil.error('Search Error', 'Failed to search experts');
    return { status: false, message: 'Failed to search experts', data: null };
  }
};

export const searchRunners = async (query: string): Promise<any> => {
  try {
    const response = await api.get(`/users/search/runners?query=${encodeURIComponent(query)}`);
    if (!response.data.status) {
      ToastUtil.error('Search Failed', response.data.message);
    }
    return response.data;
  } catch (error) {
    ToastUtil.error('Search Error', 'Failed to search runners');
    return { status: false, message: 'Failed to search runners', data: null };
  }
};

export const searchAllMessages = async (query: string): Promise<any> => {
  try {
    const response = await api.get(`/messages/search/all-messages?query=${encodeURIComponent(query)}`);
    if (!response.data.status) {
      ToastUtil.error('Search Failed', response.data.message);
    }
    return response.data;
  } catch (error) {
    ToastUtil.error('Search Error', 'Failed to search messages');
    return { status: false, message: 'Failed to search messages', data: null };
  }
};

export const searchSessionMessages = async (query: string, sessionId: string): Promise<any> => {
  try {
    const response = await api.get(`/messages/search/session-messages?query=${encodeURIComponent(query)}&sessionId=${sessionId}`);
    if (!response.data.status) {
      ToastUtil.error('Search Failed', response.data.message);
    }
    return response.data;
  } catch (error) {
    ToastUtil.error('Search Error', 'Failed to search session messages');
    return { status: false, message: 'Failed to search session messages', data: null };
  }
};
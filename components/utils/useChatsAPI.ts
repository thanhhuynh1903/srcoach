import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { MASTER_URL } from './zustandfetchAPI';

// Types
type ApiResponse<T> = {
  status: boolean;
  message: string;
  data: T | null;
};

type ChatSession = {
  id: string;
  participant1_id: string;
  participant2_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'ARCHIVE';
  participant1?: User;
  participant2?: User;
  initiatedByYou?: boolean;
  otherUser?: User;
};

type User = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
};

type Message = {
  id: string;
  type: 'MESSAGE' | 'EXPERT_RECOMMENDATION' | 'PROFILE';
  message?: string;
  created_at: string;
  user_id?: string;
  expert_id?: string;
  weight?: number;
  height?: number;
  running_level?: string;
  running_goal?: string;
};

type ProfileData = {
  weight?: number;
  height?: number;
  running_level?: string;
  running_goal?: string;
};

// Axios instance
const api = axios.create({
  baseURL: MASTER_URL
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
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
    return Promise.reject(error);
  }
);

const useChatsAPI = () => {
  // Create a new chat session
  const createSession = async (targetUserId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats/sessions', { targetUserId });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
      });
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to create session', data: null };
    }
  };

  // Get all sessions
  const getSessions = async (): Promise<ApiResponse<ChatSession[]>> => {
    try {
      const response = await api.get('/chats/sessions');
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to get sessions', data: null };
    }
  };

  // Get pending sessions
  const getPendingSessions = async (): Promise<ApiResponse<ChatSession[]>> => {
    try {
      const response = await api.get('/chats/sessions/pending');
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to get pending sessions', data: null };
    }
  };

  // Accept a session
  const acceptSession = async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.put(`/chats/sessions/${sessionId}/accept`);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
      });
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to accept session', data: null };
    }
  };

  // Reject/archive a session
  const rejectOrArchiveSession = async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.put(`/chats/sessions/${sessionId}/reject`);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
      });
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to reject session', data: null };
    }
  };

  // Send a message
  const sendMessage = async (sessionId: string, message: string, imageId?: string): Promise<ApiResponse<Message>> => {
    try {
      const response = await api.post(`/chats/sessions/${sessionId}/messages`, { message, imageId });
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to send message', data: null };
    }
  };

  // Send expert recommendation (only for experts)
  const sendExpertRecommendation = async (sessionId: string, message: string): Promise<ApiResponse<Message>> => {
    try {
      const response = await api.post(`/chats/sessions/${sessionId}/expert-recommendations`, { message });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
      });
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to send recommendation', data: null };
    }
  };

  // Send profile data
  const sendProfile = async (sessionId: string, profileData: ProfileData): Promise<ApiResponse<Message>> => {
    try {
      const response = await api.post(`/chats/sessions/${sessionId}/profiles`, profileData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message,
      });
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to send profile', data: null };
    }
  };

  // Get all messages for a session
  const getMessages = async (sessionId: string): Promise<ApiResponse<Message[]>> => {
    try {
      const response = await api.get(`/chats/sessions/${sessionId}/messages`);
      return response.data;
    } catch (error) {
      return { status: false, message: error.response?.data?.message || 'Failed to get messages', data: null };
    }
  };

  return {
    createSession,
    getSessions,
    getPendingSessions,
    acceptSession,
    rejectOrArchiveSession,
    sendMessage,
    sendExpertRecommendation,
    sendProfile,
    getMessages,
  };
};

export default useChatsAPI;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {MASTER_URL} from './zustandfetchAPI';
import ToastUtil from './utils_toast';

// Axios instance
const api = axios.create({
  baseURL: MASTER_URL,
});

// Request interceptor for auth token
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
    return Promise.reject(error);
  },
);

// Create a new chat session
export const createSession = async (targetUserId: any): Promise<any> => {
  try {
    const response = await api.post('/chats/sessions', {targetUserId});
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to create session',
      data: null,
    };
  }
};

// Get all sessions
export const getSessions = async (): Promise<any> => {
  try {
    const response = await api.get('/chats/sessions');
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get sessions',
      data: null,
    };
  }
};

// Get pending sessions
export const getPendingSessions = async (): Promise<any> => {
  try {
    const response = await api.get('/chats/sessions/pending');
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message:
        error.response?.data?.message || 'Failed to get pending sessions',
      data: null,
    };
  }
};

// Accept a session
export const acceptSession = async (sessionId: any): Promise<any> => {
  try {
    const response = await api.put(`/chats/sessions/${sessionId}/accept`);
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    ToastUtil.error('Failed to accept session', error.response?.data?.message);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to accept session',
      data: null,
    };
  }
};

// Reject/archive a session
export const rejectSession = async (sessionId: any): Promise<any> => {
  try {
    const response = await api.put(`/chats/sessions/${sessionId}/reject`);
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to reject session',
      data: null,
    };
  }
};

// Block a user
export const blockUser = async (userIdToBlock: any): Promise<any> => {
  try {
    const response = await api.post('/chats/block', {userIdToBlock});
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to block user',
      data: null,
    };
  }
};

// Unblock a user
export const unblockUser = async (userIdToUnblock: any): Promise<any> => {
  try {
    const response = await api.post('/chats/unblock', {userIdToUnblock});
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to unblock user',
      data: null,
    };
  }
};

// Get blocked users
export const getBlockedUsers = async (): Promise<any> => {
  try {
    const response = await api.get('/chats/blocked-users');
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get blocked users',
      data: null,
    };
  }
};

// Archive a message
export const archiveMessage = async (messageId: any): Promise<any> => {
  try {
    const response = await api.put(`/chats/messages/${messageId}/archive`);
    ToastUtil.success('Success', response.data.message);
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to archive message',
      data: null,
    };
  }
};

// Send a message
export const sendMessage = async (
  sessionId: any,
  message: any,
  imageId?: any,
): Promise<any> => {
  try {
    const response = await api.post(`/chats/sessions/${sessionId}/messages`, {
      message,
      imageId,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to send message',
      data: null,
    };
  }
};

// Send expert recommendation (only for experts)
export const sendExpertRecommendation = async (
  sessionId: any,
  message: any,
): Promise<any> => {
  try {
    const response = await api.post(
      `/chats/sessions/${sessionId}/expert-recommendations`,
      {message},
    );
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to send recommendation',
      data: null,
    };
  }
};

// Send profile data
export const sendProfile = async (
  sessionId: any,
  profileData: any,
): Promise<any> => {
  try {
    const response = await api.post(
      `/chats/sessions/${sessionId}/profiles`,
      profileData,
    );
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: response.data.message,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to send profile',
      data: null,
    };
  }
};

export const sendExerciseRecord = async (
  sessionId: string,
  exerciseRecord: string,
): Promise<any> => {
  try {
    const response = await api.post(
      `/chats/sessions/${sessionId}/exercise-record`,
      {exercise_session_record_id: exerciseRecord},
    );
    ToastUtil.success('Success', response.data.message);
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message:
        error.response?.data?.message || 'Failed to send exercise record',
      data: null,
    };
  }
};

// Get all messages for a session
export const getMessages = async (sessionId: any): Promise<any> => {
  try {
    const response = await api.get(`/chats/sessions/${sessionId}/messages`);
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get messages',
      data: null,
    };
  }
};

export const searchUsers = async (query: any): Promise<any> => {
  try {
    const response = await api.get(
      `/chats/search/users?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to search users',
      data: null,
    };
  }
};

export const searchExperts = async (query: any): Promise<any> => {
  try {
    const response = await api.get(
      `/chats/search/experts?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to search experts',
      data: null,
    };
  }
};

export const searchRunners = async (query: any): Promise<any> => {
  try {
    const response = await api.get(
      `/chats/search/runners?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to search runners',
      data: null,
    };
  }
};

export const getSessionInfo = async (sessionId: any): Promise<any> => {
  try {
    const response = await api.get(`/chats/sessions/${sessionId}/info`);
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get session info',
      data: null,
    };
  }
};

export const getUserInfo = async (userId: any): Promise<any> => {
  try {
    const response = await api.get(`/chats/user/${userId}`);
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get user info',
      data: null,
    };
  }
};

export const getAllMessages = async (query: any): Promise<any> => {
  try {
    const response = await api.get(
      `/chats/search/all-messages?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get all messages',
      data: null,
    };
  }
};

export const getSessionMessages = async (sessionId: any, query: any): Promise<any> => {
  try {
    const response = await api.get(
      `/chats/search/session-messages/${sessionId}?query=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (error: any) {
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to get session messages',
      data: null,
    };
  }
};


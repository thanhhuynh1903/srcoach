import axios from 'axios';
import { MASTER_URL } from './zustandfetchAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with base URL
const api = axios.create({
  baseURL: MASTER_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

interface ChatSession {
  id: string;
  participant1_id: string;
  participant2_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED' | 'MUTE' | 'ARCHIVED';
  health_data_package_id?: string | null;
  archive: boolean;
  created_at: string;
  updated_at: string;
  participant1?: {
    id: string;
    name: string;
    username: string;
    user_level: string;
    points: number;
  };
  participant2?: {
    id: string;
    name: string;
    username: string;
    user_level: string;
    points: number;
  };
  last_message?: {
    message: string;
    created_at: string;
  };
  ChatSessionMessageProfile?: ChatProfile;
  ChatSessionMessageRecommendation?: ChatRecommendation[];
}

interface ChatMessage {
  id: string;
  chat_session_id: string;
  user_id: string;
  message: string | null;
  image_url?: string | null;
  imageId?: string | null;
  archive: boolean;
  created_at: string;
  updated_at: string;
  User: {
    id: string;
    name: string | null;
    username: string | null;
    user_level: string;
  };
  Image?: {
    url: string;
    public_id: string | null;
  };
}

interface ChatProfile {
  id: string;
  chat_session_id: string;
  height?: number | null;
  weight?: number | null;
  age?: number | null;
  runningLevel?: string | null;
  goal?: string | null;
  weeklyDistance?: number | null;
  created_at: string;
  updated_at: string;
}

interface ChatRecommendation {
  id: string;
  chat_session_id: string;
  message?: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const ChatAPI = {
  // Chat operations
  createOrGetChat: async (participant2_id: string, initial_message?: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats', { participant2_id, initial_message });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to create/get chat session',
        error: error.message,
      };
    }
  },

  sendMessage: async (
    chat_session_id: string,
    message: string,
    imageId?: string
  ): Promise<ApiResponse<ChatMessage>> => {
    try {
      const response = await api.post('/chats/message', {
        chat_session_id,
        message,
        imageId,
      });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to send message',
        error: error.message,
      };
    }
  },

  getMessages: async (
    chat_session_id: string,
    includeArchived: boolean = false
  ): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      const response = await api.get(`/chats/${chat_session_id}/messages`, {
        params: { includeArchived },
      });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch messages',
        error: error.message,
      };
    }
  },

  acceptChat: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats/accept', { sessionId });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to accept chat',
        error: error.message,
      };
    }
  },

  blockChat: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats/block', { sessionId });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to block chat',
        error: error.message,
      };
    }
  },

  unblockChat: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats/unblock', { sessionId });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to unblock chat',
        error: error.message,
      };
    }
  },

  archiveChat: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats/archive', { sessionId });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to archive chat',
        error: error.message,
      };
    }
  },

  unarchiveChat: async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
    try {
      const response = await api.post('/chats/unarchive', { sessionId });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to unarchive chat',
        error: error.message,
      };
    }
  },

  listChatSessions: async (status?: string): Promise<ApiResponse<ChatSession[]>> => {
    try {
      const response = await api.get('/chats/list', {
        params: { status },
      });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch chat sessions',
        error: error.message,
      };
    }
  },

  // Profile operations
  getProfile: async (chat_session_id: string): Promise<ApiResponse<ChatProfile>> => {
    try {
      const response = await api.get(`/chats/${chat_session_id}/profile`);
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch profile',
        error: error.message,
      };
    }
  },

  updateProfile: async (
    chat_session_id: string,
    profileData: {
      height?: number;
      weight?: number;
      age?: number;
      runningLevel?: string;
      goal?: string;
      weeklyDistance?: number;
    }
  ): Promise<ApiResponse<ChatProfile>> => {
    try {
      const response = await api.post(`/chats/${chat_session_id}/profile`, profileData);
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to update profile',
        error: error.message,
      };
    }
  },

  // Recommendation operations
  getRecommendations: async (
    chat_session_id: string
  ): Promise<ApiResponse<ChatRecommendation[]>> => {
    try {
      const response = await api.get(`/chats/${chat_session_id}/recommendations`);
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch recommendations',
        error: error.message,
      };
    }
  },

  createRecommendation: async (
    chat_session_id: string,
    message: string
  ): Promise<ApiResponse<ChatRecommendation>> => {
    try {
      const response = await api.post(`/chats/${chat_session_id}/recommendations`, {
        message,
      });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to create recommendation',
        error: error.message,
      };
    }
  },
};

export default ChatAPI;
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect} from 'react';
import {MASTER_URL} from './zustandfetchAPI';

const api = axios.create({
  baseURL: MASTER_URL,
});

const useChatExpertAPI = () => {
  // Set up request interceptor to add auth token
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async config => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  
  // List chat sessions
  const listChatSessions = useCallback(async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/chats-expert', {
        params: {page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // List pending chat sessions
  const listPendingChatSessions = useCallback(async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/chats-expert/pending', {
        params: {page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // List active chat sessions
  const listActiveChatSessions = useCallback(async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/chats-expert/active', {
        params: {page, limit},
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Get chat session details
  const getChatSessionDetails = useCallback(async (chat_session_id: string) => {
    try {
      const response = await api.get(`/chats-expert/${chat_session_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Accept chat session
  const acceptChatSession = useCallback(async (chat_session_id: string) => {
    try {
      const response = await api.post(
        `/chats-expert/${chat_session_id}/accept`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Archive chat session
  const archiveChatSession = useCallback(async (chat_session_id: string) => {
    try {
      const response = await api.post(
        `/chats-expert/${chat_session_id}/archive`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Create recommendation
  const createRecommendation = useCallback(
    async (chat_session_id: string, message: string) => {
      try {
        const response = await api.post(
          `/chats-expert/${chat_session_id}/recommendations`,
          {
            message,
          },
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  // Get recommendations
  const getRecommendations = useCallback(async (chat_session_id: string) => {
    try {
      const response = await api.get(
        `/chats-expert/${chat_session_id}/recommendations`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Get chat profile
  const getChatProfile = useCallback(async (chat_session_id: string) => {
    try {
      const response = await api.get(
        `/chats-expert/${chat_session_id}/profile`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const getMessages = async (
    chat_session_id: string,
    includeArchived: boolean = false,
  ): Promise<any> => {
    try {
      const response = await api.get(`/chats/${chat_session_id}/messages`, {
        params: {includeArchived},
      });
      return response.data;
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to fetch messages',
        error: error.message,
      };
    }
  };

  return {
    listChatSessions,
    listPendingChatSessions,
    listActiveChatSessions,
    getChatSessionDetails,
    acceptChatSession,
    archiveChatSession,
    createRecommendation,
    getRecommendations,
    getChatProfile,
    getMessages,
  };
};

export default useChatExpertAPI;

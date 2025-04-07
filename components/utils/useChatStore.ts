import {create} from 'zustand';
import useApiStore from './zustandfetchAPI';

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

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: ChatMessage[];
  profile: ChatProfile | null;
  recommendations: ChatRecommendation[];
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // Chat operations
  createOrGetChat: (
    participant2_id: string,
  ) => Promise<ApiResponse<ChatSession>>;
  sendMessage: (
    chat_session_id: string,
    message: string,
    imageId?: string,
  ) => Promise<ApiResponse<ChatMessage>>;
  getMessages: (
    chat_session_id: string,
    includeArchived?: boolean,
  ) => Promise<ApiResponse<ChatMessage[]>>;
  acceptChat: (sessionId: string) => Promise<ApiResponse<ChatSession>>;
  blockChat: (sessionId: string) => Promise<ApiResponse<ChatSession>>;
  unblockChat: (sessionId: string) => Promise<ApiResponse<ChatSession>>;
  archiveChat: (sessionId: string) => Promise<ApiResponse<ChatSession>>;
  unarchiveChat: (sessionId: string) => Promise<ApiResponse<ChatSession>>;
  listChatSessions: (
    status?: string,
  ) => Promise<ApiResponse<ChatSession[]>>;

  // Profile operations
  getProfile: (chat_session_id: string) => Promise<ApiResponse<ChatProfile>>;
  updateProfile: (
    chat_session_id: string,
    profileData: {
      height?: number;
      weight?: number;
      age?: number;
      runningLevel?: string;
      goal?: string;
      weeklyDistance?: number;
    },
  ) => Promise<ApiResponse<ChatProfile>>;

  // Recommendation operations
  getRecommendations: (
    chat_session_id: string,
  ) => Promise<ApiResponse<ChatRecommendation[]>>;
  createRecommendation: (
    chat_session_id: string,
    message: string,
  ) => Promise<ApiResponse<ChatRecommendation>>;

  // Clear state
  clearCurrentSession: () => void;
  clearSessions: () => void;
  clearMessages: () => void;
  clearProfile: () => void;
  clearRecommendations: () => void;
  clearError: () => void;
  clearMessage: () => void;
}

const useChatStore = create<ChatState>(set => ({
  currentSession: null,
  sessions: [],
  messages: [],
  profile: null,
  recommendations: [],
  isLoading: false,
  error: null,
  message: null,

  // Chat operations
  createOrGetChat: async participant2_id => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/chats', {
        participant2_id,
      });

      if (response?.status) {
        set({
          currentSession: response.data,
          message: response.message || 'Chat session created/retrieved',
          isLoading: false,
        });
        return response;
      } else {
        set({
          error: response?.message || 'Failed to create/get chat session',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create/get chat session',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  sendMessage: async (chat_session_id, message, imageId) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/chats/message', {
        chat_session_id,
        message,
        imageId,
      });

      if (response?.status) {
        set({
          message: 'Message sent successfully',
          isLoading: false,
        });
        // Refresh messages
        await useChatStore.getState().getMessages(chat_session_id);
        return response;
      } else {
        set({
          error: response?.message || 'Failed to send message',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to send message',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  getMessages: async (chat_session_id, includeArchived = false) => {
    set({isLoading: true, error: null});
    try {
      let url = `/chats/${chat_session_id}/messages`;
      if (includeArchived) {
        url += `?includeArchived=true`;
      }

      console.log(url)

      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<ChatMessage[]>>(url);

        console.log(response)

      if (response?.status) {
        set({
          messages: response.data || [],
          isLoading: false,
        });
        return response;
      } else {
        set({
          error: response?.message || 'Failed to fetch messages',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch messages',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  acceptChat: async sessionId => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/chats/accept', {
        sessionId,
      });

      if (response?.status) {
        set({
          currentSession: response.data,
          message: 'Chat session accepted',
          isLoading: false,
        });
        await useChatStore.getState().listChatSessions();
        return response;
      } else {
        set({
          error: response?.message || 'Failed to accept chat',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to accept chat',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  blockChat: async sessionId => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/chats/block', {
        sessionId,
      });

      if (response?.status) {
        set({
          currentSession: response.data,
          message: 'Chat blocked',
          isLoading: false,
        });
        await useChatStore.getState().listChatSessions();
        return response;
      } else {
        set({
          error: response?.message || 'Failed to block chat',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to block chat',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  unblockChat: async sessionId => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/chats/unblock', {
        sessionId,
      });

      if (response?.status) {
        set({
          currentSession: response.data,
          message: 'Chat unblocked',
          isLoading: false,
        });
        await useChatStore.getState().listChatSessions();
        return response;
      } else {
        set({
          error: response?.message || 'Failed to unblock chat',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to unblock chat',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  archiveChat: async sessionId => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore.getState().postData('/chats/archive', {
        sessionId,
      });

      if (response?.status) {
        set({
          currentSession: response.data,
          message: 'Chat archived',
          isLoading: false,
        });
        await useChatStore.getState().listChatSessions();
        return response;
      } else {
        set({
          error: response?.message || 'Failed to archive chat',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to archive chat',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  unarchiveChat: async sessionId => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData('/chats/unarchive', {
          sessionId,
        });

      if (response?.status) {
        set({
          currentSession: response.data,
          message: 'Chat unarchived',
          isLoading: false,
        });
        await useChatStore.getState().listChatSessions();
        return response;
      } else {
        set({
          error: response?.message || 'Failed to unarchive chat',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to unarchive chat',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  listChatSessions: async (status) => {
    set({isLoading: true, error: null});
    try {
      let url = '/chats/list';
      if (status) {
        url += `?status=${status}`;
      }

      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<ChatSession[]>>(url);

      if (response?.status) {
        set({
          sessions: response.data || [],
          isLoading: false,
        });
        return response;
      } else {
        set({
          error: response?.message || 'Failed to fetch chat sessions',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch chat sessions',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  // Profile operations
  getProfile: async chat_session_id => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<ChatProfile>>(
          `/chats/${chat_session_id}/profile`,
        );

      if (response?.status) {
        set({
          profile: response.data,
          isLoading: false,
        });
        return response;
      } else {
        set({
          error: response?.message || 'Failed to fetch profile',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch profile',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  updateProfile: async (chat_session_id, profileData) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData(`/chats/${chat_session_id}/profile`, profileData);

      if (response?.status) {
        set({
          profile: response.data,
          message: 'Profile updated successfully',
          isLoading: false,
        });
        return response;
      } else {
        set({
          error: response?.message || 'Failed to update profile',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update profile',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  // Recommendation operations
  getRecommendations: async chat_session_id => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .fetchData<ApiResponse<ChatRecommendation[]>>(
          `/chats/${chat_session_id}/recommendations`,
        );

      if (response?.status) {
        set({
          recommendations: response.data || [],
          isLoading: false,
        });
        return response;
      } else {
        set({
          error: response?.message || 'Failed to fetch recommendations',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch recommendations',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  createRecommendation: async (chat_session_id, message) => {
    set({isLoading: true, error: null});
    try {
      const response = await useApiStore
        .getState()
        .postData(`/chats/${chat_session_id}/recommendations`, {message});

      if (response?.status) {
        set({
          message: 'Recommendation created successfully',
          isLoading: false,
        });
        await useChatStore.getState().getRecommendations(chat_session_id);
        return response;
      } else {
        set({
          error: response?.message || 'Failed to create recommendation',
          isLoading: false,
        });
        return {
          status: false,
          message: response?.message,
          error: response?.message,
        };
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create recommendation',
        isLoading: false,
      });
      return {status: false, message: error.message, error: error.message};
    }
  },

  // Clear state
  clearCurrentSession: () => set({currentSession: null}),
  clearSessions: () => set({sessions: []}),
  clearMessages: () => set({messages: []}),
  clearProfile: () => set({profile: null}),
  clearRecommendations: () => set({recommendations: []}),
  clearError: () => set({error: null}),
  clearMessage: () => set({message: null}),
}));

export default useChatStore;
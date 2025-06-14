import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MASTER_URL} from './zustandfetchAPI';
import ToastUtil from './utils_toast';

const api = axios.create({baseURL: MASTER_URL});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    ToastUtil.error(
      'Error',
      error.response?.data?.message || 'An error occurred',
    );
    return Promise.reject(error);
  },
);

export const searchUsers = async (query: string) => {
  const response = await api.get(
    `/chats/search/users?query=${encodeURIComponent(query)}`,
  );
  if (!response.data.status)
    ToastUtil.error('Search Failed', response.data.message);
  return response.data;
};

export const searchExperts = async (query: string) => {
  const response = await api.get(
    `/chats/search/experts?query=${encodeURIComponent(query)}`,
  );
  if (!response.data.status)
    ToastUtil.error('Search Failed', response.data.message);
  return response.data;
};

export const searchRunners = async (query: string) => {
  const response = await api.get(
    `/chats/search/runners?query=${encodeURIComponent(query)}`,
  );
  if (!response.data.status)
    ToastUtil.error('Search Failed', response.data.message);
  return response.data;
};

export const searchAllMessages = async (query: string) => {
  const response = await api.get(
    `/chats/search/all-messages?query=${encodeURIComponent(query)}`,
  );
  if (!response.data.status)
    ToastUtil.error('Search Failed', response.data.message);
  return response.data;
};

export const searchSessionMessages = async (
  query: string,
  sessionId: string,
) => {
  const response = await api.get(
    `/chats/search/session-messages?query=${encodeURIComponent(
      query,
    )}&sessionId=${sessionId}`,
  );
  if (!response.data.status)
    ToastUtil.error('Search Failed', response.data.message);
  return response.data;
};

export const createOrGetSession = async (
  otherUserId: string,
  initialMessage: string,
) => {
  const response = await api.post('/chats/session', {
    otherUserId,
    initial_message: initialMessage,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const sendNormalMessage = async (sessionId: string, content: string) => {
  const response = await api.post('/chats/session/message/normal', {
    session_id: sessionId,
    content,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const sendProfileMessage = async (sessionId: string) => {
  const response = await api.post('/chats/session/message/profile', {
    session_id: sessionId,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const fillProfileMessage = async (message: string, content: any) => {
  const response = await api.patch('/chats/session/message/profile', {
    message_id: message,
    height: content.height,
    weight: content.weight,
    issues: content.issues,
    type: content.type
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const sendExerciseRecordMessage = async (
  sessionId: string,
  recordId: string,
) => {
  const response = await api.post('/chats/session/message/exercise-record', {
    session_id: sessionId,
    exercise_session_record_id: recordId,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const sendExpertRecommendation = async (
  sessionId: string,
  content: string,
) => {
  const response = await api.post(
    '/chats/session/message/expert-recommendation',
    {
      session_id: sessionId,
      content,
    },
  );
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const sendImageMessage = async (sessionId: string, imageUri: string) => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'image.jpg';

  let mimeType = 'image/jpeg';
  if (filename.endsWith('.png')) mimeType = 'image/png';
  if (filename.endsWith('.gif')) mimeType = 'image/gif';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as any);

  formData.append('session_id', sessionId);

  try {
    const response = await api.post('/chats/session/message/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.status) {
      ToastUtil.error('Error', response.data.message);
    }
    return response.data;
  } catch (error) {
    ToastUtil.error('Error', 'Failed to send image message');
    throw error;
  }
};

export const getSessionMessages = async (
  userId: string,
  limit = 30,
  cursor?: string | null,
) => {
  const response = await api.get('/chats/session/messages', {
    params: {
      otherUserId: userId,
      limit,
      cursor: cursor || undefined,
    },
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const getSessionInfo = async (userId: string) => {
  const response = await api.get('/chats/session/info', {
    params: {otherUserId: userId},
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const archiveMessage = async (messageId: string) => {
  const response = await api.delete(
    '/chats/session/message?message_id=' + messageId,
  );
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const respondToSession = async (userId: string, accept: boolean) => {
  const response = await api.post('/chats/session/respond', {
    otherUserId: userId,
    accept,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const listSessions = async (status: string | null) => {
  const response = await api.get(`/chats/sessions?status=${status}`);
  console.log('response', response.data);
  
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const archiveSession = async (userId: string) => {
  const response = await api.post('/chats/session/archive', {
    otherUserId: userId,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const acceptExpertRecommendation = async (messageId: string) => {
  const response = await api.post(
    '/chats/session/message/expert-recommendation/accept',
    {
      messageId,
    },
  );
  if (!response.data.status) {
    ToastUtil.error('Error', response.data.message);
  } else {
    ToastUtil.success('Success', response.data.message);
  }
  return response.data;
};

export const rejectExpertRecommendation = async (messageId: string) => {
  const response = await api.post(
    '/chats/session/message/expert-recommendation/reject',
    {
      messageId,
    },
  );
  if (!response.data.status) {
    ToastUtil.error('Error', response.data.message);
  } else {
    ToastUtil.success('Success', response.data.message);
  }
  return response.data;
};

export const markSessionMessagesAsRead = async (userId: string) => {
  const response = await api.post('/chats/session/mark-read', {
    otherUserId: userId,
  });
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

export const markAllMessagesAsRead = async () => {
  const response = await api.post('/chats/session/mark-all-read');
  if (!response.data.status) ToastUtil.error('Error', response.data.message);
  return response.data;
};

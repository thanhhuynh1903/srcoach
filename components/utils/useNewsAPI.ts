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

export async function getAllNews() {
  try {
    const response = await api.get('/news');
    const resData = response.data;
    if (resData.status === 'success') {
      console.log(resData.data)
      return resData.data;
    } else {
      ToastUtil.error('Error', 'An error occured retreiving news');
    }

    return []
  } catch (error) {
    ToastUtil.error('Error', 'An error occured retreiving news');
    return []
  }
}

export async function getNewsDetail(id: string) {
  try {
    const response = await api.get(`/news/${id}`);
    const resData = response.data;
    if (resData.status === 'success') {
      return resData;
    } else {
      ToastUtil.error('Error', 'An error occured retreiving news detail');
    }
  } catch (error) {
    ToastUtil.error('Error', 'An error occured retreiving news detail');
  }
}


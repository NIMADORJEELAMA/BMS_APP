import axios from 'axios';
import {Platform} from 'react-native';
import {getToken} from '../utils/storage';

const axiosInstance = axios.create({
  // Using your working IP for the real device
  baseURL:
    Platform.OS === 'android'
      ? 'http://192.168.29.142:3000'
      : 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach token to every request
axiosInstance.interceptors.request.use(
  async config => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default axiosInstance;

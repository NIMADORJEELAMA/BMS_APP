// export default axiosInstance;
import axios from 'axios';
import {Platform, Alert} from 'react-native';
import {getToken, removeToken} from '../utils/storage';
import {logout} from '../redux/slices/authSlice';
import store from '../redux/store'; // Import your actual store file

const stagingUrl = 'https://api-staging.hilltoptourism.in';
const BASE_URL = 'https://api.hilltoptourism.in';

// 1. Create the instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// 2. Request Interceptor (Outgoing)
axiosInstance.interceptors.request.use(
  async config => {
    const token = await getToken();
    if (token) {
      // Note: Keep the 'xyz' only while testing your 401 logic!
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// 3. Response Interceptor (Incoming)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // ONLY logout if it's NOT a login attempt
      await removeToken();
      store.dispatch(logout());
      Alert.alert('Session Expired', 'Please login again.');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

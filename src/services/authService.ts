import axiosInstance from './axiosInstance';

export const authService = {
  login: async (credentials: any) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    console.log('response', response);
    return response.data;
  },

  // Future endpoints will look like this:
  getTables: async () => {
    const response = await axiosInstance.get('/tables');
    return response.data;
  },
};

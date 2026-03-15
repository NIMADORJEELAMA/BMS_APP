// services/userService.ts
import axiosInstance from './axiosInstance';

export interface User {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  // add other fields as per your API
}

export const userService = {
  /**
   * Fetches all active users/staff members
   */
  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get('/users');
    // Common practice: filter active users here if the backend doesn't
    return response.data.filter((user: User) => user.isActive);
  },

  /**
   * Fetches a specific user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },
};

import { login, register, getCurrentUser } from './api';

const authService = {
  // Login
  login: async (email, password) => {
    return await login(email, password);
  },

  // Register
  register: async (userData) => {
    return await register(userData);
  },

  // Get current user
  getCurrentUser: async () => {
    return await getCurrentUser();
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
import axios from 'axios';

// Base URL backend FastAPI Anda
const BASE_URL = process.env.REACT_APP_API_URL || 'https://finalweblanjutana-production.up.railway.app';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor untuk token authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor untuk handle error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Functions

// Authentication API
export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('username', email); // FastAPI OAuth2 uses 'username'
    formData.append('password', password);
    
    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get current user');
  }
};

// Applications API
export const getApplications = async (params = {}) => {
  try {
    const response = await api.get('/applications', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch applications');
  }
};

export const getApplicationsByUser = async (userId, params = {}) => {
  try {
    const response = await api.get(`/applications/user/${userId}`, { params });
    // Make sure we have a valid response format
    if (response.data && typeof response.data === 'object') {
      // If the response is not in the expected format, convert it
      if (!response.data.items && Array.isArray(response.data)) {
        console.log('Converting array response to paginated format');
        return {
          items: response.data,
          total: response.data.length,
          page: 1,
          limit: response.data.length
        };
      }
      return response.data;
    } else {
      console.error('Invalid response format:', response.data);
      return { items: [], total: 0, page: 1, limit: 10 };
    }
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user applications');
  }
};

export const getApplicationsByJob = async (jobPostId, params = {}) => {
  try {
    const response = await api.get(`/applications/job/${jobPostId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch applications by job');
  }
};

export const createApplication = async (applicationData) => {
  try {
    const response = await api.post('/applications', applicationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create application');
  }
};

export const updateApplication = async (applicationId, updateData) => {
  try {
    const response = await api.put(`/applications/${applicationId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update application');
  }
};

// Job Posts API
export const getJobPosts = async (params = {}) => {
  try {
    const response = await api.get('/job-posts', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch job posts');
  }
};

export const getJobPost = async (jobPostId) => {
  try {
    const response = await api.get(`/job-posts/${jobPostId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch job post');
  }
};

export const createJobPost = async (jobPostData) => {
  try {
    const response = await api.post('/job-posts', jobPostData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create job post');
  }
};

export const updateJobPost = async (jobPostId, updateData) => {
  try {
    const response = await api.put(`/job-posts/${jobPostId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update job post');
  }
};

export const deleteJobPost = async (jobPostId) => {
  try {
    await api.delete(`/job-posts/${jobPostId}`);
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete job post');
  }
};

// Profiles API
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/profiles/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch user profile');
  }
};

export const createUserProfile = async (profileData) => {
  try {
    const response = await api.post('/profiles', profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create profile');
  }
};

export const updateUserProfile = async (profileId, updateData) => {
  try {
    const response = await api.put(`/profiles/${profileId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update profile');
  }
};

// Users API
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch users');
  }
};

export const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch user');
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update user');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create user');
  }
};

export const deleteUser = async (userId) => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete user');
  }
};

// Verify password without actually logging in
export const verifyPassword = async (credentials) => {
  try {
    const response = await api.post('/auth/verify-password', credentials);
    return response.data.verified;
  } catch (error) {
    return false; // Return false if verification fails
  }
};

export default api;
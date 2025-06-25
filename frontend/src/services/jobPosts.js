import api from './api';

export const jobPostService = {
  // Get all job posts
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/job-posts/?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get job post by ID
  getById: async (id) => {
    const response = await api.get(`/job-posts/${id}`);
    return response.data;
  },

  // Create new job post
  create: async (jobData) => {
    const response = await api.post('/job-posts/', jobData);
    return response.data;
  },

  // Update job post
  update: async (id, jobData) => {
    const response = await api.put(`/job-posts/${id}`, jobData);
    return response.data;
  },

  // Delete job post
  delete: async (id) => {
    const response = await api.delete(`/job-posts/${id}`);
    return response.data;
  },

  // Get job posts by user
  getByUser: async (userId, page = 1, limit = 10) => {
    const response = await api.get(`/job-posts/user/${userId}?skip=${(page-1)*limit}&limit=${limit}`);
    return response.data;
  },

  // Alias untuk backward compatibility
  getJobPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/job-posts/?page=${page}&limit=${limit}`);
    return {
      jobs: response.data.items || response.data,
      totalPages: response.data.total_pages || 1,
      currentPage: response.data.current_page || page,
      total: response.data.total || 0
    };
  }
};

export default jobPostService;
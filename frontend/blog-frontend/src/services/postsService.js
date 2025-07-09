import axios from 'axios';

const API_URL = 'http://localhost:5000/api/posts';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all posts
const getPosts = async ({ page = 1, limit = 10, sort = '-createdAt', search = '' }, token = null) => {
  const config = {
    params: { page, limit, sort, search },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  
  const response = await api.get('/', config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get posts');
};

// Get single post
const getPost = async (postId, token = null) => {
  const config = {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  
  const response = await api.get(`/${postId}`, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get post');
};

// Create post
const createPost = async (postData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post('/', postData, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to create post');
};

// Update post
const updatePost = async (postId, postData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.put(`/${postId}`, postData, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to update post');
};

// Delete post
const deletePost = async (postId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.delete(`/${postId}`, config);
  
  if (response.data.success) {
    return response.data;
  }
  
  throw new Error(response.data.message || 'Failed to delete post');
};

// Like/unlike post
const toggleLike = async (postId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post(`/${postId}/like`, {}, config);
  
  if (response.data.success) {
    return {
      postId,
      ...response.data.data,
    };
  }
  
  throw new Error(response.data.message || 'Failed to toggle like');
};

const postsService = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};

export default postsService;


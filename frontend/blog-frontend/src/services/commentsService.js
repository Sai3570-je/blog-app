import axios from 'axios';

const API_URL = 'http://localhost:5000/api/comments';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get comments for a post
const getComments = async ({ postId, page = 1, limit = 20, sort = '-createdAt' }, token = null) => {
  const config = {
    params: { page, limit, sort },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  
  const response = await api.get(`/post/${postId}`, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get comments');
};

// Create comment
const createComment = async ({ postId, content }, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post(`/post/${postId}`, { content }, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to create comment');
};

// Update comment
const updateComment = async ({ commentId, content }, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.put(`/${commentId}`, { content }, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to update comment');
};

// Delete comment
const deleteComment = async (commentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.delete(`/${commentId}`, config);
  
  if (response.data.success) {
    return response.data;
  }
  
  throw new Error(response.data.message || 'Failed to delete comment');
};

// Get comments by user
const getUserComments = async ({ userId, page = 1, limit = 20 }, token = null) => {
  const config = {
    params: { page, limit },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  
  const response = await api.get(`/user/${userId}`, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get user comments');
};

const commentsService = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getUserComments,
};

export default commentsService;


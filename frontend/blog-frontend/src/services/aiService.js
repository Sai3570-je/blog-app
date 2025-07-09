import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get title suggestions
const suggestTitles = async ({ topic, count = 5 }, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post('/suggest-title', { topic, count }, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get title suggestions');
};

// Get content ideas
const suggestContent = async ({ title, keywords }, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post('/suggest-content', { title, keywords }, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get content suggestions');
};

// Get content improvement suggestions
const improveContent = async ({ content, focusArea }, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post('/improve-content', { content, focusArea }, config);
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get content improvements');
};

// Get AI service status
const getStatus = async () => {
  const response = await api.get('/status');
  
  if (response.data.success) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to get AI status');
};

const aiService = {
  suggestTitles,
  suggestContent,
  improveContent,
  getStatus,
};

export default aiService;


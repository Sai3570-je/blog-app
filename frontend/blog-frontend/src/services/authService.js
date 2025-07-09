import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register user
const register = async (userData) => {
  const response = await api.post('/register', userData);
  
  if (response.data.success) {
    const { user, token } = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return { user, token };
  }
  
  throw new Error(response.data.message || 'Registration failed');
};

// Login user
const login = async (userData) => {
  const response = await api.post('/login', userData);
  
  if (response.data.success) {
    const { user, token } = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return { user, token };
  }
  
  throw new Error(response.data.message || 'Login failed');
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Get user profile
const getProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.get('/me', config);
  
  if (response.data.success) {
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  throw new Error(response.data.message || 'Failed to get profile');
};

// Update user profile
const updateProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.put('/profile', userData, config);
  
  if (response.data.success) {
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  throw new Error(response.data.message || 'Failed to update profile');
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};

export default authService;


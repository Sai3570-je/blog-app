import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile } from '../store/slices/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in on app start
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, token, user]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'student' | 'admin';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  loginWithGoogle: (idToken: string) => Promise<User>;
  sendOtp: (email: string, purpose: 'login' | 'forgot_password') => Promise<void>;
  resetPassword: (email: string, otp: string, password: string) => Promise<void>;
  sendRegisterOtp: (email: string) => Promise<void>;
  verifyRegisterOtp: (email: string, otp: string, fullName: string, password: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };




  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google/', { id_token: idToken });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string, purpose: 'login' | 'forgot_password'): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/auth/otp/send/', { email, purpose });
    } finally {
      setLoading(false);
    }
  };

  const sendRegisterOtp = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/auth/register/send-otp/', { email });
    } finally {
      setLoading(false);
    }
  };

  const verifyRegisterOtp = async (email: string, otp: string, fullName: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register/verify/', { email, otp, full_name: fullName, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, otp: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset/', { email, otp, password });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, isAdmin,
      loginWithGoogle, sendOtp, resetPassword,
      sendRegisterOtp, verifyRegisterOtp
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

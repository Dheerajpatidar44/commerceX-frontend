import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cx_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const safeUser = data.user;
      setUser(safeUser);
      localStorage.setItem('cx_user', JSON.stringify(safeUser));
      localStorage.setItem('cx_token', data.token);
      return safeUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      const newUser = data.user;
      setUser(newUser);
      localStorage.setItem('cx_user', JSON.stringify(newUser));
      localStorage.setItem('cx_token', data.token);
      return newUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('cx_user', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.error('Failed to sync user data', err);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cx_user');
    localStorage.removeItem('cx_token');
  }, []);

  const value = { user, isLoading, login, register, logout, syncUser, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

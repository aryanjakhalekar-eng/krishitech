import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('krishirakshak_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('krishirakshak_token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data && res.data.id && res.data.role) {
            setUser(res.data);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session token invalid or expired, clearing session:', err);
          logout();
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };
    fetchMe();
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('krishirakshak_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('krishirakshak_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

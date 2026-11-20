import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aura_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load me on mount
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('aura_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get<User>('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to authenticate stored token:', err);
        localStorage.removeItem('aura_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('aura_token', res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/register', {
      full_name: name,
      email,
      password,
      phone,
    });
    localStorage.setItem('aura_token', res.data.access_token);
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('aura_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const res = await api.put<User>('/auth/me', data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin',
      }}
    >
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


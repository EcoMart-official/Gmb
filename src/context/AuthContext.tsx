import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types';
import { api } from '../lib/api';

interface AuthContextValue {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: CustomerUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('rankora_token') || localStorage.getItem('reputepulse_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      if (data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('rankora_token');
        localStorage.removeItem('reputepulse_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('rankora_token');
      localStorage.removeItem('reputepulse_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = (newToken: string, newUser: CustomerUser) => {
    localStorage.setItem('rankora_token', newToken);
    localStorage.removeItem('reputepulse_token');
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('rankora_token');
    localStorage.removeItem('reputepulse_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

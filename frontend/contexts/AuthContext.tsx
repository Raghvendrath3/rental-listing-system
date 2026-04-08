'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthState } from '@/types/auth.types';
import {
  getToken,
  parseToken,
  clearToken,
  storeToken,
  isTokenValid,
} from '@/lib/tokenManager';

interface AuthContextType extends AuthState {
  login: (token: string, user: AuthState['user']) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      
      if (token && isTokenValid()) {
        const decoded = parseToken(token);
        if (decoded.isValid) {
          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            token,
            user: {
              id: decoded.userId,
              email: '', // Email not stored in token, will be fetched if needed
              role: decoded.role,
            },
            loading: false,
          }));
        } else {
          // Token is invalid, clear it
          clearToken();
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
        }
      } else {
        // No valid token
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, user: AuthState['user']) => {
    storeToken(token);
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      token,
      user,
      error: null,
    }));
  };

  const logout = () => {
    clearToken();
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading,
    }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setLoading,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

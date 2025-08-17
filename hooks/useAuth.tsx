'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for stored auth on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('auth-user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Restored user from localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with real API
    const mockUser: AuthUser = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      token: 'mock-jwt-token'
    };

    console.log('Logging in user:', mockUser);
    localStorage.setItem('auth-token', mockUser.token);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const register = async (name: string, email: string, password: string) => {
    // Mock registration - replace with real API
    const mockUser: AuthUser = {
      id: Date.now().toString(),
      email,
      name,
      token: 'mock-jwt-token'
    };

    console.log('Registering user:', mockUser);
    localStorage.setItem('auth-token', mockUser.token);
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route wrapper
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('ProtectedRoute status:', { isAuthenticated, isLoading, user });
    if (!isLoading && !isAuthenticated) {
      console.log('Redirecting to login...');
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
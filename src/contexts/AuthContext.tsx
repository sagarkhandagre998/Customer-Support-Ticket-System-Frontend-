'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, LoginFormData, LoginResponse, RegisterFormData } from '@/types';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { DEMO_USERS } from '@/lib/demoData';

// Demo credentials
const DEMO_CREDENTIALS = {
  'user@demo.com': { password: 'user123', user: DEMO_USERS[0] },
  'agent@demo.com': { password: 'agent123', user: DEMO_USERS[1] },
  'admin@demo.com': { password: 'admin123', user: DEMO_USERS[2] },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check if it's a demo token
          if (token.startsWith('demo-token-')) {
            // Get the stored demo user ID
            const demoUserId = localStorage.getItem('demoUserId');
            const demoUser = DEMO_USERS.find(user => user.id === demoUserId) || DEMO_USERS[0];
            setUser(demoUser);
          } else {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if it's a demo user
      const demoCredential = DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS];
      if (demoCredential && demoCredential.password === password) {
        // Demo login
        const mockToken = `demo-token-${Date.now()}`;
        localStorage.setItem('token', mockToken);
        localStorage.setItem('demoUserId', demoCredential.user.id);
        setUser(demoCredential.user);
        toast.success(`Welcome back, ${demoCredential.user.name}!`);
        return;
      }
      
      // Real API login
      try {
        console.log('Attempting real API login for:', email);
        const response = await authAPI.login({ email, password });
        console.log('Login response:', response);
        
        localStorage.setItem('token', response.token);
        
        // Backend returns { token, role, email } - we need to construct a user object
        // Since the backend doesn't seem to have a /auth/me endpoint, we'll use the login response directly
        const userFromLogin: User = {
          id: response.email, // Use email as ID since we don't have a real ID
          email: response.email,
          role: response.role, // Backend returns ROLE_ADMIN, ROLE_USER, etc.
          name: response.email.split('@')[0], // Use email prefix as name
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(userFromLogin);
        toast.success('Login successful!');
        console.log('User set from login response:', userFromLogin);
        
        // Try to fetch additional user data if available, but don't fail if it's not
        try {
          console.log('Attempting to fetch additional user data...');
          const fullUser = await authAPI.getCurrentUser();
          console.log('Additional user data fetched:', fullUser);
          
          // Merge the data, keeping the role from login response
          const mergedUser = {
            ...fullUser,
            role: response.role // Always use the role from login response
          };
          
          setUser(mergedUser);
          console.log('Merged user data set:', mergedUser);
        } catch (userFetchError) {
          console.log('No additional user data available, using login response data');
          // This is fine - the login response has all the essential data we need
        }
      } catch (apiError: any) {
        // If API login fails, check if it's a network error or backend issue
        console.error('API login error:', apiError);
        if (!apiError.response) {
          // Network error - backend might be down
          toast.error('Cannot connect to server. Please try again later.');
        } else {
          // Backend responded with error
          toast.error(apiError.response?.data?.message || 'Login failed');
        }
        throw apiError;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Registration successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demoUserId');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

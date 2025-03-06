import { createContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/api';
import { AuthContextType, User } from './types';

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify the token and get user data
          const userData = await auth.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          console.error('Auth token invalid:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await auth.login(email, password);
    const { token, user } = response;

    // Store token in localStorage
    localStorage.setItem('token', token);

    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');

    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('spec_manager_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, _password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser: User = {
      id: '1',
      username,
      email: `${username}@example.com`,
    };

    setUser(mockUser);
    localStorage.setItem('spec_manager_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockUser: User = {
      id: '2',
      username: 'github_user',
      email: 'github_user@example.com',
    };

    setUser(mockUser);
    localStorage.setItem('spec_manager_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('spec_manager_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGithub,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
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

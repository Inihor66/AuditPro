import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        // Sync user state with Vercel serverless in case of container reciclations/cold-starts
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: u })
        }).catch(err => console.error('Failed to sync auth session on reload:', err));
      } catch (err) {
        console.error('Error loading session from localStorage:', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

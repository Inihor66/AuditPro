import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getSyncPayload } from '../lib/syncInterceptor';

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
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('auth_user');
    } catch (e) {
      console.warn('localStorage is blocked or unavailable in this environment:', e);
    }
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        // Sync user state with Vercel serverless in case of container reciclations/cold-starts
        // We now aggregate and send all client-side backups of created data (apps, forms, chats, transactions)
        const syncPayload = getSyncPayload(u);
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncPayload)
        }).catch(err => console.error('Failed to sync auth session on reload:', err));
      } catch (err) {
        console.error('Error loading session from localStorage:', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (u: User) => {
    setUser(u);
    try {
      localStorage.setItem('auth_user', JSON.stringify(u));
    } catch (e) {
      console.warn('Failed to set localStorage:', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('auth_user');
    } catch (e) {
      console.warn('Failed to remove localStorage:', e);
    }
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

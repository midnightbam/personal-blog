// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getCurrentSession();
        const currentUser = await authService.getCurrentUser();
        
        setSession(currentSession);
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await authService.isAdmin();
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await authService.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    isAdmin,
    isAuthenticated: !!user,
  };
};
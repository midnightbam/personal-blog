import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { authService } from "../services/authService";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userId) => {
    if (!userId) return false;
    
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        console.error("❌ Error checking admin status:", error?.message);
        return false;
      }

      return profile.role === "admin";
    } catch (err) {
      console.error("❌ Error checking admin status:", err);
      return false;
    }
  };

  // Refresh session when it might have expired
  const refreshSessionIfNeeded = useCallback(async () => {
    try {
      // First try to get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return false;
      }

      if (!currentSession) {
        console.log('⚠️ No session found, checking if we have a refresh token stored...');
        
        // Try to refresh with stored refresh token as a fallback
        try {
          const { data: { session: recoveredSession }, error: recoveryError } = await supabase.auth.refreshSession();
          
          if (recoveryError || !recoveredSession) {
            console.log('❌ Cannot recover session, user needs to login again');
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            return false;
          }

          console.log('✅ Session recovered from refresh token');
          setSession(recoveredSession);
          setUser(recoveredSession.user);
          const adminStatus = await checkAdminStatus(recoveredSession.user.id);
          setIsAdmin(adminStatus);
          return true;
        } catch (recoveryErr) {
          console.error('❌ Failed to recover session:', recoveryErr);
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          return false;
        }
      }

      // Session exists, check if token needs refresh (expires in less than 10 minutes instead of 5)
      const expiresAt = currentSession.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 600) { // Less than 10 minutes - refresh earlier
        console.log('🔄 Token expiring soon (' + timeUntilExpiry + 's), refreshing...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          console.error('❌ Failed to refresh session:', refreshError);
          
          // Try to recover with a new refresh attempt
          try {
            const { data: { session: secondAttempt }, error: secondError } = await supabase.auth.refreshSession();
            if (secondError || !secondAttempt) {
              setUser(null);
              setSession(null);
              setIsAdmin(false);
              return false;
            }
            setSession(secondAttempt);
            setUser(secondAttempt.user);
            const adminStatus = await checkAdminStatus(secondAttempt.user.id);
            setIsAdmin(adminStatus);
            return true;
          } catch (secondErr) {
            console.error('❌ Second recovery attempt failed:', secondErr);
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            return false;
          }
        }

        console.log('✅ Session refreshed successfully');
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        const adminStatus = await checkAdminStatus(refreshedSession.user.id);
        setIsAdmin(adminStatus);
        return true;
      }

      console.log('✅ Session is still valid (' + timeUntilExpiry + 's until expiry)');
      return true;
    } catch (err) {
      console.error('❌ Error refreshing session:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let subscription = null;
    let refreshInterval = null;
    let focusListener = null;

    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state changed:', event, session?.user?.email);
          
          const currentUser = session?.user || null;
          setSession(session);
          setUser(currentUser);
          
          if (currentUser) {
            const adminStatus = await checkAdminStatus(currentUser.id);
            setIsAdmin(adminStatus);
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      );
      return subscription;
    };

    async function initialize() {
      try {
        console.log('🔄 Initializing auth...');
        const currentSession = await authService.getCurrentSession();
        const currentUser = currentSession?.user || null;
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentUser);
          
          if (currentUser) {
            const adminStatus = await checkAdminStatus(currentUser.id);
            if (mounted) setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) setLoading(false);
      }

      // Setup auth listener after initial check
      if (mounted) {
        subscription = setupAuthListener();
      }

      // Setup periodic session refresh every 2 minutes (instead of 4)
      if (mounted) {
        refreshInterval = setInterval(async () => {
          console.log('🔄 Periodic session check (every 2 min)...');
          await refreshSessionIfNeeded();
        }, 2 * 60 * 1000);
      }

      // Setup window focus listener - refresh session when coming back from another tab
      if (mounted) {
        focusListener = async () => {
          console.log('👁️ Window focused, checking session...');
          await refreshSessionIfNeeded();
        };
        window.addEventListener('focus', focusListener);
      }
    }

    initialize();

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = async (e) => {
      if (e.key === 'supabase.auth.token') {
        console.log('🔄 Auth token changed in another tab, syncing...');
        try {
          const currentSession = await authService.getCurrentSession();
          const currentUser = currentSession?.user || null;
          
          if (mounted) {
            setSession(currentSession);
            setUser(currentUser);
            
            if (currentUser) {
              const adminStatus = await checkAdminStatus(currentUser.id);
              if (mounted) setIsAdmin(adminStatus);
            } else {
              setIsAdmin(false);
            }
          }
        } catch (error) {
          console.error('Error syncing auth from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup function
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (focusListener) {
        window.removeEventListener('focus', focusListener);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshSessionIfNeeded]); // Include refreshSessionIfNeeded in dependencies

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
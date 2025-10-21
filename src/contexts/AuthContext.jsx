import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check if user is admin
  const checkAdminStatus = async (userId) => {
    try {
      console.log("🔍 Checking admin status for user:", userId);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Admin check timeout")), 5000)
      );

      const queryPromise = supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      const { data: profile, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);

      if (error) {
        console.error("❌ Error fetching profile:", error.message, error.code);
        console.log("⚠️ Assuming user is NOT admin due to error");
        return false;
      }

      if (!profile) {
        console.warn("⚠️ No profile found for user:", userId);
        console.log("ℹ️ Profile data:", profile);
        return false;
      }

      const admin = profile?.role === "admin";
      console.log("✅ Admin check complete - isAdmin:", admin, "Role:", profile?.role);
      return admin;
    } catch (err) {
      console.error("❌ Exception in checkAdminStatus:", err.message);
      console.log("⚠️ Assuming user is NOT admin due to exception");
      return false;
    }
  };

  // Main auth effect - handles both init and state changes
  useEffect(() => {
    console.log("🔵 Setting up auth listener...");
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🟢 Auth event:", event, "User:", session?.user?.email);
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        // If user exists, check admin status
        if (currentUser) {
          console.log("👤 User logged in, checking admin status...");
          const adminStatus = await checkAdminStatus(currentUser.id);
          console.log("🔐 Admin status set to:", adminStatus);
          setIsAdmin(adminStatus);
        } else {
          console.log("👤 User logged out");
          setIsAdmin(false);
        }
        
        console.log("✅ Auth loading complete");
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log("🔴 Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
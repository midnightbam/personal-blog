// lib/auth.js
import { supabase } from "./supabase";

export const authService = {
  // Login
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign up
  async signup(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Reset password (send email)
  async sendPasswordReset(email, redirectTo) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    
    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};
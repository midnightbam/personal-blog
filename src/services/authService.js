// src/services/authService.js
import { supabase } from '../lib/supabase';

class AuthService {
  /**
   * Sign up a new user
   */
  async signup(email, password, metadata = {}) {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (signUpError) throw signUpError;

      // If signup successful and user exists, create profile
      if (authData.user) {
        // Insert into users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: authData.user.email,
            name: metadata.name || '',
            username: metadata.username || '',
            avatar_url: null,
            created_at: new Date().toISOString(),
          }]);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }

        // Create profile with default user role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            role: 'user', // default role
            created_at: new Date().toISOString(),
          }]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  }

  /**
   * Log in an existing user
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store user data in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.session.access_token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid login credentials');
    }
  }

  /**
   * Log out the current user
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to log out');
    }
  }

  /**
   * Get the current user session
   */
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    const session = await this.getCurrentSession();
    return !!session;
  }

  /**
   * Check if user has admin role
   */
  async isAdmin() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      // Check profiles table for role
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data?.role === 'admin';
    } catch (error) {
      console.error('Check admin error:', error);
      return false;
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return subscription;
  }
}

export const authService = new AuthService();
export default authService;
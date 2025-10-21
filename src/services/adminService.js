import { supabase } from '../lib/supabase';

export const adminService = {
  // Create a new admin user
  async createAdminUser(email, password, name) {
    try {
      // Step 1: Sign up the user in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const userId = authData.user.id;

      // Step 2: Create user profile in users table
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: email,
          name: name,
          created_at: new Date().toISOString(),
        }]);

      if (userError) throw userError;

      // Step 3: Create profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          role: 'admin',
          created_at: new Date().toISOString(),
        }]);

      if (profileError) throw profileError;

      return { success: true, userId, email };
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  },

  // Promote an existing user to admin
  async promoteUserToAdmin(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  },

  // Get user's role
  async getUserRole(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  },

  // Check if user is admin
  async isAdmin(userId) {
    try {
      const role = await this.getUserRole(userId);
      return role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Get all users with their roles (admin only)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, created_at, profiles(role)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Demote admin to regular user
  async demoteAdminToUser(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error demoting user:', error);
      throw error;
    }
  }
};

export default adminService;

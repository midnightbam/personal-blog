import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    if (req.method === 'GET') {
      // Get user profile
      const { data, error } = await supabase
        .from('users')
        .select('id, name, username, avatar_url, email, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }
        throw error;
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { name, username, avatar_url } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (avatar_url) updateData.avatar_url = avatar_url;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data,
      });
    }

    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to handle user profile',
    });
  }
}

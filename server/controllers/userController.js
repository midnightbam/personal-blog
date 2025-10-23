import { supabase, checkSupabase } from '../utils/supabase.js';

export const getUser = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, bio, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      throw error;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

    const { userId } = req.params;
    const { name, bio, avatar_url } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...(name && { name }),
        ...(bio && { bio }),
        ...(avatar_url && { avatar_url }),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

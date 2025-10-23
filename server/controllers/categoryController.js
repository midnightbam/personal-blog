import { supabase, checkSupabase } from '../utils/supabase.js';

export const getAllCategories = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

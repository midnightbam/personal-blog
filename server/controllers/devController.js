// Temporary development endpoint to publish all draft articles
// This is ONLY for development - should be removed before production

import { supabase, checkSupabase } from '../utils/supabase.js';

export const publishAllDrafts = async (req, res) => {
  try {
    // Safety check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Not allowed in production' });
    }

    if (!checkSupabase(res)) return;

    const { data, error } = await supabase
      .from('articles')
      .update({ status: 'Published' })
      .eq('status', 'Draft')
      .select();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `Published ${data?.length || 0} articles`,
      data,
    });
  } catch (error) {
    console.error('Error publishing drafts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

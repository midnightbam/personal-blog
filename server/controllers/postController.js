import { supabase, checkSupabase } from '../utils/supabase.js';

export const getAllPosts = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const category = req.query.category;

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query
      .eq('status', 'Published')
      .order('date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('status', 'Published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      throw error;
    }

    // Increment view count
    if (data) {
      const newViews = (data.views || 0) + 1;
      await supabase
        .from('articles')
        .update({ views: newViews })
        .eq('id', id);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

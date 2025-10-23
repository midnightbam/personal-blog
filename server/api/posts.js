import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Check if variables exist
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing Supabase credentials',
        debug: process.env.NODE_ENV === 'development' ? {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        } : undefined,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all posts with pagination
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const category = req.query.category;

    let query = supabase
      .from('articles')
      .select('*, category:category_id(name), author:user_id(name, avatar_url)', { count: 'exact' });

    if (category) {
      query = query.eq('category_id', category);
    }

    const { data, error, count } = await query
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch posts',
    });
  }
}

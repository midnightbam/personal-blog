import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
    }

    if (req.method === 'GET') {
      // Get likes count and check if user liked
      const { userId } = req.query;

      const { data, error: countError } = await supabase
        .from('likes')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);

      if (countError) throw countError;

      let userLiked = false;
      if (userId) {
        const { data: userLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single();

        userLiked = !!userLike;
      }

      return res.status(200).json({
        success: true,
        data: {
          count: data?.length || 0,
          userLiked,
        },
      });
    }

    if (req.method === 'POST') {
      // Add a like
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      // Check if already liked
      const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Already liked',
        });
      }

      const { error } = await supabase
        .from('likes')
        .insert([{
          post_id: postId,
          user_id: userId,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Post liked',
      });
    }

    if (req.method === 'DELETE') {
      // Remove a like
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Like removed',
      });
    }

    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to handle likes',
    });
  }
}

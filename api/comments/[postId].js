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
      // Get comments for a post
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:user_id(id, name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: data || [],
      });
    }

    if (req.method === 'POST') {
      // Create a new comment
      const { content, userId } = req.body;

      if (!content || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Content and userId are required',
        });
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: userId,
          content,
          created_at: new Date().toISOString(),
        }])
        .select('*, author:user_id(id, name, avatar_url)')
        .single();

      if (error) throw error;

      return res.status(201).json({
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
      error: error.message || 'Failed to handle comments',
    });
  }
}

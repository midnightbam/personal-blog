import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️  Supabase not configured');
}

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express server running on Vercel' });
});

// ===== POSTS =====
app.get('/posts', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const category = req.query.category;

    let query = supabase.from('articles')
      .select('*, category:category_id(name), author:user_id(name, avatar_url)', { count: 'exact' });

    if (category) query = query.eq('category_id', category);

    const { data, error, count } = await query
      .eq('status', 'Published')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    res.json({ success: true, data, pagination: { page, limit, total: count, pages: Math.ceil((count || 0) / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/posts/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('articles')
      .select('*, category:category_id(name), author:user_id(name, avatar_url, email)')
      .eq('id', id)
      .eq('status', 'Published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ success: false, error: 'Post not found' });
      throw error;
    }

    if (data) {
      const newViews = (data.views || 0) + 1;
      await supabase.from('articles').update({ views: newViews }).eq('id', id);
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== CATEGORIES =====
app.get('/categories', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { data, error } = await supabase.from('categories').select('id, name').order('name');
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== COMMENTS =====
app.get('/comments/:postId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { postId } = req.params;
    if (!postId) return res.status(400).json({ success: false, error: 'Post ID required' });

    const { data, error } = await supabase.from('comments')
      .select('*, author:user_id(id, name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/comments/:postId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { postId } = req.params;
    const { content, userId } = req.body;
    if (!postId || !content || !userId) return res.status(400).json({ success: false, error: 'Missing required fields' });

    const { data, error } = await supabase.from('comments')
      .insert([{ post_id: postId, user_id: userId, content, created_at: new Date().toISOString() }])
      .select('*, author:user_id(id, name, avatar_url)')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/comments/:commentId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { commentId } = req.params;
    if (!commentId) return res.status(400).json({ success: false, error: 'Comment ID required' });

    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw error;
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== LIKES =====
app.get('/likes/:postId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { postId } = req.params;
    const { userId } = req.query;
    if (!postId) return res.status(400).json({ success: false, error: 'Post ID required' });

    const { count, error: countError } = await supabase.from('likes')
      .select('id', { count: 'exact' })
      .eq('post_id', postId);

    if (countError) throw countError;

    let userLiked = false;
    if (userId) {
      const { data: userLike } = await supabase.from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      userLiked = !!userLike;
    }

    res.json({ success: true, count: count || 0, userLiked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/likes/:postId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    if (!postId || !userId) return res.status(400).json({ success: false, error: 'Post and User IDs required' });

    const { data, error } = await supabase.from('likes')
      .insert([{ post_id: postId, user_id: userId, created_at: new Date().toISOString() }])
      .select().single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/likes/:postId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    if (!postId || !userId) return res.status(400).json({ success: false, error: 'Post and User IDs required' });

    const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
    if (error) throw error;
    res.json({ success: true, message: 'Like removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== USERS =====
app.get('/users/:userId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const { data, error } = await supabase.from('users')
      .select('id, name, email, bio, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ success: false, error: 'User not found' });
      throw error;
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/users/:userId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  
  try {
    const { userId } = req.params;
    const { name, bio, avatar_url } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const { data, error } = await supabase.from('users')
      .update({ ...(name && { name }), ...(bio && { bio }), ...(avatar_url && { avatar_url }) })
      .eq('id', userId)
      .select().single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default app;

// This is the Vercel serverless function entry point
// It imports and exports the Express app from the server directory

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️  Warning: Supabase credentials not found. API routes will fail.');
}

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Content Security Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://supabaseapi.supabase.co https://fonts.googleapis.com; frame-ancestors 'none'"
  );
  next();
});

// Helper to check Supabase
const checkSupabase = (res) => {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase not configured' });
    return false;
  }
  return true;
};

// ===== POSTS =====
app.get('/api/posts', async (req, res) => {
  if (!checkSupabase(res)) return;
  
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

app.get('/api/posts/:id', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .select('*, category:category_id(name), author:user_id(name, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Post not found');
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const userId = req.body.user_id;
    if (!userId) return res.status(401).json({ error: 'User ID required' });

    const { data, error } = await supabase
      .from('articles')
      .insert([req.body]);

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .update(req.body)
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== CATEGORIES =====
app.get('/api/categories', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== COMMENTS =====
app.get('/api/posts/:postId/comments', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:user_id(name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:postId/comments', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .insert([{ ...req.body, post_id: postId }]);

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { commentId } = req.params;
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== LIKES =====
app.get('/api/posts/:postId/likes', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { postId } = req.params;
    const { data, error, count } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('post_id', postId);

    if (error) throw error;
    res.json({ success: true, data, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:postId/likes', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { postId } = req.params;
    const userId = req.body.user_id;

    if (!userId) return res.status(401).json({ error: 'User ID required' });

    const { data, error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/posts/:postId/likes/:likeId', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { likeId } = req.params;
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', likeId);

    if (error) throw error;
    res.json({ success: true, message: 'Like deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== USERS =====
app.get('/api/users/:userId', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('users')
      .update(req.body)
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== NOTIFICATIONS =====
app.get('/api/notifications', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(401).json({ error: 'User ID required' });

    const { data, error } = await supabase
      .from('notifications')
      .select('*, comment:comment_id(text), article:article_id(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/notifications/:notificationId', async (req, res) => {
  if (!checkSupabase(res)) return;

  try {
    const { notificationId } = req.params;
    const { data, error } = await supabase
      .from('notifications')
      .update(req.body)
      .eq('id', notificationId);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express server running on Vercel' });
});

export default app;

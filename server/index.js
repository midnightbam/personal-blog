import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
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

// Helper to check Supabase
const checkSupabase = (res) => {
  if (!supabase) {
    res.status(500).json({ success: false, error: 'Supabase not initialized' });
    return false;
  }
  return true;
};

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', supabaseReady: !!supabase });
});

// ===== POSTS ROUTES =====
app.get('/api/posts', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    
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
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Post ID is required' });
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*, category:category_id(name), author:user_id(name, avatar_url, email)')
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
});

// ===== CATEGORIES ROUTES =====
app.get('/api/categories', async (req, res) => {
  try {
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
});

// ===== COMMENTS ROUTES =====
app.get('/api/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
    }

    const { data, error } = await supabase
      .from('comments')
      .select('*, author:user_id(id, name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/api/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
    }

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

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        error: 'Comment ID is required',
      });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== LIKES ROUTES =====
app.get('/api/likes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
    }

    const { data, error: countError, count } = await supabase
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

    res.status(200).json({
      success: true,
      count: count || 0,
      userLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/api/likes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID and User ID are required',
      });
    }

    const { data, error } = await supabase
      .from('likes')
      .insert([{
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error creating like:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.delete('/api/likes/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID and User ID are required',
      });
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Like removed successfully',
    });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===== USER ROUTES =====
app.get('/api/users/:userId', async (req, res) => {
  try {
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
});

app.put('/api/users/:userId', async (req, res) => {
  try {
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
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🔒 CORS enabled for: ${CORS_ORIGIN}`);
});

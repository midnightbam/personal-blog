import { supabase, checkSupabase } from '../utils/supabase.js';

export const getLikes = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

    const { postId } = req.params;
    const { userId } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
    }

    const { count, error: countError } = await supabase
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
};

export const createLike = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

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
};

export const deleteLike = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

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
};

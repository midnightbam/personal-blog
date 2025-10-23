import { supabase, checkSupabase } from '../utils/supabase.js';

export const getComments = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

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
};

export const createComment = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

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
};

export const deleteComment = async (req, res) => {
  try {
    if (!checkSupabase(res)) return;

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
};

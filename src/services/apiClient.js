import supabase from '../lib/supabase.js';

const API_URL = import.meta.env.VITE_API_URL || 'https://blog-post-project-api.vercel.app';

// ============= HELPER FUNCTIONS =============
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token;
};

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status}`);
  }
  
  return data;
};

// ============= POSTS API =============
export const postsAPI = {
  // Get all posts with pagination
  getAll: async (page = 1, limit = 10, category = null) => {
    try {
      let query = supabase.from('posts').select('*, categories(name), users(name, profile_pic)');
      
      if (category) {
        query = query.eq('category_id', category);
      }
      
      const { data, error, count } = await query
        .eq('status_id', 1) // Published only
        .order('date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      
      return { data, total: count, page, limit };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get single post
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name), users(id, name, profile_pic, email)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Increment views
      await supabase
        .from('posts')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);
      
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Create new post
  create: async (postData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: postData.title,
          description: postData.description,
          content: postData.content,
          image: postData.image,
          category_id: postData.category_id,
          user_id: user.id,
          date: new Date().toISOString(),
          status_id: postData.status_id || 1, // 1 = published, 2 = draft
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Update post
  update: async (id, postData) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: postData.title,
          description: postData.description,
          content: postData.content,
          image: postData.image,
          category_id: postData.category_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Delete post
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Get user's posts
  getUserPosts: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Search posts
  search: async (query) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(name), users(name)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('status_id', 1)
        .limit(20);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },
};

// ============= COMMENTS API =============
export const commentsAPI = {
  // Get comments for a post
  getByPostId: async (postId) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, users(id, name, profile_pic, email)')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Create comment
  create: async (postId, commentText) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          comment_text: commentText,
          created_at: new Date().toISOString(),
        }])
        .select('*, users(id, name, profile_pic, email)')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Update comment
  update: async (commentId, commentText) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update({ comment_text: commentText })
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete comment
  delete: async (commentId) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};

// ============= LIKES API =============
export const likesAPI = {
  // Check if user liked a post
  hasLiked: async (postId, userId) => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return !!data;
    } catch (error) {
      console.error('Error checking like:', error);
      return false;
    }
  },

  // Add like
  add: async (postId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const hasLiked = await likesAPI.hasLiked(postId, user.id);
      if (hasLiked) return { already_liked: true };
      
      const { data, error } = await supabase
        .from('likes')
        .insert([{
          post_id: postId,
          user_id: user.id,
          liked_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Remove like
  remove: async (postId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing like:', error);
      throw error;
    }
  },

  // Get like count
  getCount: async (postId) => {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('id', { count: 'exact' })
        .eq('post_id', postId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting like count:', error);
      return 0;
    }
  },
};

// ============= USERS API =============
export const usersAPI = {
  // Get user profile
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, profile_pic, role')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, profileData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          profile_pic: profileData.profile_pic,
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user by ID (public info)
  getById: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, profile_pic')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
};

// ============= CATEGORIES API =============
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

export default {
  postsAPI,
  commentsAPI,
  likesAPI,
  usersAPI,
  categoriesAPI,
};
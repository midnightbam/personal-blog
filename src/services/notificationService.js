// src/services/notificationService.js
import { supabase } from '../lib/supabase';

export const notificationService = {
  /**
   * Create notification when admin publishes a new article
   */
  async notifyNewArticle(articleId, articleTitle, authorId) {
    try {
      console.log('Creating notifications for new article:', articleTitle);

      // Get all users except the author
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .neq('id', authorId);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      if (!users || users.length === 0) {
        console.log('No users to notify');
        return;
      }

      // Create notifications for all users
      const notifications = users.map(user => ({
        user_id: user.id,
        article_id: articleId,
        type: 'new_article',
        message: `New article published: ${articleTitle}`,
        is_read: false,
        created_at: new Date().toISOString()
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      } else {
        console.log(`Created ${notifications.length} notifications for new article`);
      }
    } catch (error) {
      console.error('Exception in notifyNewArticle:', error);
    }
  },

  /**
   * Create notification when user likes an article
   * Notifies: Article author
   */
  async notifyNewLike(articleId, likerId, likerName, articleTitle) {
    try {
      console.log('Creating notification for new like by:', likerName);

      // Get article author
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('user_id, title')
        .eq('id', articleId)
        .single();

      if (articleError) {
        console.error('Error fetching article:', articleError);
        return;
      }

      // Only notify if the liker is not the author
      if (article.user_id && article.user_id !== likerId) {
        // Get liker's avatar URL
        const { data: likerData } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', likerId)
          .maybeSingle();

        const likerAvatar = likerData?.avatar_url || null;

        const { error: insertError } = await supabase
          .from('notifications')
          .insert([{
            user_id: article.user_id,
            article_id: articleId,
            type: 'like_on_your_article',
            message: `${likerName} liked your article: ${articleTitle}`,
            commenter_id: likerId,
            commenter_name: likerName,
            commenter_avatar: likerAvatar,
            is_read: false,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Error creating like notification:', insertError);
        } else {
          console.log('Created notification for new like');
        }
      }
    } catch (error) {
      console.error('Exception in notifyNewLike:', error);
    }
  },

  /**
   * Create notification when user comments on article
   * Notifies: 1) Article author, 2) Other users who commented on same article
   */
  async notifyNewComment(articleId, commenterId, commenterName, articleTitle) {
    try {
      console.log('Creating notifications for new comment by:', commenterName);

      // Get article author
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('user_id, title')
        .eq('id', articleId)
        .single();

      if (articleError) {
        console.error('Error fetching article:', articleError);
        return;
      }

      // Get commenter's avatar URL
      const { data: commenterData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', commenterId)
        .maybeSingle();

      const commenterAvatar = commenterData?.avatar_url || null;

      const notifications = [];

      // 1. Notify article author (if not the commenter)
      if (article.user_id && article.user_id !== commenterId) {
        notifications.push({
          user_id: article.user_id,
          article_id: articleId,
          type: 'comment_on_your_article',
          message: `${commenterName} commented on your article: ${articleTitle}`,
          commenter_id: commenterId,
          commenter_name: commenterName,
          commenter_avatar: commenterAvatar,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      // 2. Get all users who have commented on this article (except current commenter and author)
      const { data: previousCommenters, error: commentersError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('article_id', articleId)
        .neq('user_id', commenterId);

      if (!commentersError && previousCommenters) {
        // Get unique user IDs (excluding the article author if already added)
        const uniqueCommenters = [...new Set(
          previousCommenters
            .map(c => c.user_id)
            .filter(id => id !== article.user_id)
        )];

        // Create notifications for other commenters
        uniqueCommenters.forEach(userId => {
          notifications.push({
            user_id: userId,
            article_id: articleId,
            type: 'comment_on_article_you_commented',
            message: `${commenterName} also commented on "${articleTitle}"`,
            commenter_id: commenterId,
            commenter_name: commenterName,
            commenter_avatar: commenterAvatar,
            is_read: false,
            created_at: new Date().toISOString()
          });
        });
      }

      // Insert all notifications
      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error inserting notifications:', insertError);
        } else {
          console.log(`Created ${notifications.length} notifications for new comment`);
        }
      }
    } catch (error) {
      console.error('Exception in notifyNewComment:', error);
    }
  },

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getUserNotifications:', error);
      return [];
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Exception in getUnreadCount:', error);
      return 0;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      }
    } catch (error) {
      console.error('Exception in markAsRead:', error);
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
      }
    } catch (error) {
      console.error('Exception in markAllAsRead:', error);
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
      }
    } catch (error) {
      console.error('Exception in deleteNotification:', error);
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(userId, callback) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from notifications
   */
  unsubscribeFromNotifications(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};

export default notificationService;
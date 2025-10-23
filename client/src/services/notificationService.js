// src/services/notificationService.js
import { supabase } from '../lib/supabase';

export const notificationService = {
  /**
   * Create notification when admin publishes a new article
   * Admin receives: "You published a new article"
   * Users receive: "Admin username published a new article: Title"
   */
  async notifyNewArticle(articleId, articleTitle, authorId, authorName) {
    try {
      console.log('Creating notifications for new article:', articleTitle);

      // Get all users
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .order('id');

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      if (!allUsers || allUsers.length === 0) {
        console.log('No users to notify');
        return;
      }

      // Separate admin from other users
      const adminUser = allUsers.find(u => u.id === authorId);
      const otherUsers = allUsers.filter(u => u.id !== authorId);

      const notifications = [];

      // Notification for admin (author)
      if (adminUser) {
        notifications.push({
          user_id: authorId,
          article_id: articleId,
          type: 'new_article',
          message: `You published a new article: ${articleTitle}`,
          actor_id: authorId,
          actor_name: authorName,
          actor_avatar: adminUser.avatar_url,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      // Notifications for other users
      otherUsers.forEach(user => {
        notifications.push({
          user_id: user.id,
          article_id: articleId,
          type: 'new_article',
          message: `${authorName} published a new article: ${articleTitle}`,
          actor_id: authorId,
          actor_name: authorName,
          actor_avatar: adminUser?.avatar_url || null,
          is_read: false,
          created_at: new Date().toISOString()
        });
      });

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
   * Notifies: 1) Article author, 2) Other users who liked the same article
   */
  async notifyNewLike(articleId, likerId, likerName, articleTitle) {
    try {
      console.log('Creating notification for new like by:', likerName);

      // Get article author and liker info
      const [articleResponse, likerResponse] = await Promise.all([
        supabase
          .from('articles')
          .select('user_id, title')
          .eq('id', articleId)
          .single(),
        supabase
          .from('users')
          .select('avatar_url')
          .eq('id', likerId)
          .maybeSingle()
      ]);

      if (articleResponse.error) {
        console.error('Error fetching article:', articleResponse.error);
        return;
      }

      if (likerResponse.error) {
        console.warn('Error fetching liker avatar:', likerResponse.error);
      }

      const article = articleResponse.data;
      const likerAvatar = likerResponse.data?.avatar_url || null;
      const notifications = [];

      console.log('🖼️  Liker avatar URL:', likerAvatar);
      console.log('📊 Liker data:', likerResponse.data);

      // 1. Notify article author if the liker is not the author
      if (article.user_id && article.user_id !== likerId) {
        notifications.push({
          user_id: article.user_id,
          article_id: articleId,
          type: 'like_on_your_article',
          message: `${likerName} liked your article: ${articleTitle}`,
          actor_id: likerId,
          actor_name: likerName,
          actor_avatar: likerAvatar,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      // 2. Get all users who have liked this article (except current liker and author)
      const { data: previousLikers, error: likersError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('article_id', articleId)
        .neq('user_id', likerId);

      if (!likersError && previousLikers) {
        // Get unique user IDs (excluding the article author if already added)
        const uniqueLikers = [...new Set(
          previousLikers
            .map(l => l.user_id)
            .filter(id => id !== article.user_id)
        )];

        // Create notifications for other users who liked the same article
        uniqueLikers.forEach(userId => {
          notifications.push({
            user_id: userId,
            article_id: articleId,
            type: 'like_on_article_you_liked',
            message: `${likerName} also liked "${articleTitle}"`,
            actor_id: likerId,
            actor_name: likerName,
            actor_avatar: likerAvatar,
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
          console.error('Error creating like notification:', insertError);
        } else {
          console.log(`Created ${notifications.length} notifications for new like`);
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
  async notifyNewComment(articleId, commenterId, commenterName, articleTitle, commentText) {
    try {
      console.log('Creating notifications for new comment by:', commenterName);
      console.log('Comment text:', commentText);

      // Get article author and commenter info
      const [articleResponse, commenterResponse] = await Promise.all([
        supabase
          .from('articles')
          .select('user_id, title')
          .eq('id', articleId)
          .single(),
        supabase
          .from('users')
          .select('avatar_url')
          .eq('id', commenterId)
          .maybeSingle()
      ]);

      if (articleResponse.error) {
        console.error('Error fetching article:', articleResponse.error);
        return;
      }

      if (commenterResponse.error) {
        console.warn('Error fetching commenter avatar:', commenterResponse.error);
      }

      const article = articleResponse.data;
      const commenterAvatar = commenterResponse.data?.avatar_url || null;
      const notifications = [];

      // 1. Notify article author (if not the commenter)
      if (article.user_id && article.user_id !== commenterId) {
        console.log('Notifying article author:', article.user_id);
        console.log('Commenter avatar:', commenterAvatar);
        
        notifications.push({
          user_id: article.user_id,
          article_id: articleId,
          type: 'comment_on_your_article',
          message: `${commenterName} commented on your article: ${articleTitle}`,
          comment_text: commentText,
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
            comment_text: commentText,
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
        console.log('About to insert notifications:', JSON.stringify(notifications, null, 2));
        
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error inserting notifications:', insertError);
        } else {
          console.log(`Created ${notifications.length} notifications for new comment`);
        }
      } else {
        console.log('No notifications to create (commenter is the author or no other commenters)');
      }
    } catch (error) {
      console.error('Exception in notifyNewComment:', error);
    }
  },

  /**
   * Get notifications for a user with full user data and fresh actor avatars
   */
  async getUserNotifications(userId, limit = 50) {
    try {
      console.log('📡 getUserNotifications called with userId:', userId, 'limit:', limit);
      
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          user_id,
          article_id,
          type,
          message,
          comment_text,
          actor_id,
          actor_name,
          commenter_id,
          commenter_name,
          is_read,
          created_at,
          articles (
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        return [];
      }

      // Fetch fresh actor avatar data for each notification
      const notificationsWithFreshAvatars = await Promise.all(
        (data || []).map(async (notification) => {
          let actor_avatar = null;
          let commenter_avatar = null;

          // Get fresh actor avatar if actor_id exists
          if (notification.actor_id) {
            const { data: actorData } = await supabase
              .from('users')
              .select('avatar_url')
              .eq('id', notification.actor_id)
              .maybeSingle();
            
            actor_avatar = actorData?.avatar_url || null;
          }

          // Get fresh commenter avatar if commenter_id exists
          if (notification.commenter_id) {
            const { data: commenterData } = await supabase
              .from('users')
              .select('avatar_url')
              .eq('id', notification.commenter_id)
              .maybeSingle();
            
            commenter_avatar = commenterData?.avatar_url || null;
          }

          return {
            ...notification,
            actor_avatar,
            commenter_avatar
          };
        })
      );

      console.log(`✅ Got ${notificationsWithFreshAvatars?.length || 0} notifications for user ${userId}`);
      if (notificationsWithFreshAvatars && notificationsWithFreshAvatars.length > 0) {
        console.log('📋 First notification:', notificationsWithFreshAvatars[0]);
      }

      return notificationsWithFreshAvatars || [];
    } catch (error) {
      console.error('❌ Exception in getUserNotifications:', error);
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
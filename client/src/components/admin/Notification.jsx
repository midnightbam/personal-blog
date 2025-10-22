import React, { useState, useEffect } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { supabase } from '../../lib/supabase';

export default function Notification({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await notificationService.getUserNotifications(user.id, 100);
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      console.log('New notification received:', newNotification);
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      if (channel) {
        notificationService.unsubscribeFromNotifications(channel);
      }
    };
  }, [user?.id]);

  const handleViewNotification = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    }

    // Navigate to article
    if (notification.article_id) {
      window.location.href = `/article/${notification.article_id}`;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'new_article':
        return `New article published: ${notification.message}`;
      case 'like_on_your_article':
        return `${notification.commenter_name} liked your article: ${notification.message}`;
      case 'comment_on_your_article':
        return `${notification.commenter_name} commented on your article`;
      case 'comment_on_article_you_commented':
        return `${notification.commenter_name} also commented on "${notification.message}"`;
      default:
        return notification.message;
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex-1 bg-white min-h-screen flex items-center justify-center">
        <p className="text-stone-600">Please log in to view notifications</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base md:text-lg font-semibold text-stone-800">
            Notifications
          </h1>
          {notifications.some(n => !n.is_read) && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-400 rounded-full">
              {notifications.filter(n => !n.is_read).length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs md:text-sm text-stone-600 hover:text-stone-800 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 md:px-8 py-4 md:py-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-0">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`py-4 flex items-start justify-between gap-3 border-b border-stone-200 last:border-b-0 transition-colors ${
                  !notification.is_read ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-stone-600">
                      {getUserInitials(notification.commenter_name)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 break-words">
                      {getNotificationMessage(notification)}
                    </p>
                    
                    <p className="mt-2 text-xs text-stone-500">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  )}
                  <button 
                    onClick={() => handleViewNotification(notification)}
                    className="text-xs md:text-sm font-medium text-stone-800 underline underline-offset-2 hover:text-stone-600 transition-colors whitespace-nowrap"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-xs text-stone-500 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
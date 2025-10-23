import React, { useState, useEffect } from 'react';
import { Menu, Loader2, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';

export default function Notification({ setSidebarOpen }) {
  const { user } = useAuth();
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const NOTIFICATIONS_PER_PAGE = 10;

  // Fetch notifications from database
  const fetchNotifications = async (silent = false) => {
    if (!user?.id) return;

    try {
      if (!silent) setLoading(true);
      const data = await notificationService.getUserNotifications(user.id, 100);
      setAllNotifications(data);
      setCurrentPage(1); // Reset to first page when fetching new data
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (!silent) setError('Failed to load notifications');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch, real-time subscription, and auto-polling
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = notificationService.subscribeToNotifications(user.id, (newNotification) => {
      console.log('New notification received:', newNotification);
      setAllNotifications(prev => [newNotification, ...prev]);
    });

    // Auto-refresh notifications every 5 seconds (polling fallback for real-time)
    const pollInterval = setInterval(async () => {
      console.log('🔄 Auto-polling notifications...');
      await fetchNotifications(true); // Silent refresh
    }, 5000);

    return () => {
      if (channel) {
        notificationService.unsubscribeFromNotifications(channel);
      }
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications(false);
  };

  const handleViewNotification = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        
        // Update local state
        setAllNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    // Don't redirect - just mark as read and stay on the dashboard
    // Both admins and users just mark as read on this page
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await notificationService.markAllAsRead(user.id);
      setAllNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setAllNotifications(prev => prev.filter(n => n.id !== notificationId));
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
    // Use the articles relationship if available
    const articleTitle = notification.articles?.title || 'Article';
    
    switch (notification.type) {
      case 'new_article':
        return `New article published: ${articleTitle}`;
      case 'like_on_your_article':
        return `${notification.actor_name} liked your article: ${articleTitle}`;
      case 'comment_on_your_article':
        return `${notification.commenter_name} commented on your article: ${articleTitle}`;
      case 'comment_on_article_you_commented':
        return `${notification.commenter_name} also commented on &quot;${articleTitle}&quot;`;
      default:
        return notification.message;
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Pagination calculations
  const totalPages = Math.ceil(allNotifications.length / NOTIFICATIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
  const endIndex = startIndex + NOTIFICATIONS_PER_PAGE;
  const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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
          {allNotifications.some(n => !n.is_read) && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-orange-400 rounded-full">
              {allNotifications.filter(n => !n.is_read).length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title="Refresh notifications"
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-5 h-5 text-stone-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {allNotifications.some(n => !n.is_read) && (
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

        {allNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500">No notifications yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {paginatedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 md:p-3 flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                  !notification.is_read 
                    ? 'bg-orange-50 hover:bg-orange-100' 
                    : 'bg-white hover:bg-stone-50'
                }`}
                onClick={() => handleViewNotification(notification)}
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {notification.actor_avatar || notification.commenter_avatar ? (
                      <img
                        src={notification.actor_avatar || notification.commenter_avatar}
                        alt={notification.commenter_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-stone-600">
                          {getUserInitials(notification.commenter_name)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-stone-800 break-words leading-tight font-medium">
                      {notification.commenter_name || notification.actor_name}
                    </p>
                    <p className="text-xs text-stone-600 break-words leading-tight mt-0.5">
                      {getNotificationMessage(notification)}
                    </p>
                    
                    {notification.comment_text && (
                      <p className="text-xs text-stone-600 italic mt-1 p-1.5 bg-stone-100 rounded border-l-2 border-stone-300 break-words">
                        &quot;{notification.comment_text}&quot;
                      </p>
                    )}
                    
                    <p className="mt-1 text-xs text-stone-500">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewNotification(notification);
                    }}
                    className="text-xs font-medium text-stone-600 hover:text-stone-800 transition-colors whitespace-nowrap"
                  >
                    View
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className="text-xs text-stone-500 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
                <div className="text-sm text-stone-600">
                  Page {currentPage} of {totalPages} ({allNotifications.length} total)
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-700" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-orange-400 text-white'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-700" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
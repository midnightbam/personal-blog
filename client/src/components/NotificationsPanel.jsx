import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Loader2, X } from "lucide-react";
import { notificationService } from "../services/notificationService";
import { supabase } from "../lib/supabase";

const NotificationsPanel = ({ userId, variant = "dropdown" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen && variant === "dropdown") {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, variant]);

  // Fetch notifications and setup real-time listener
  useEffect(() => {
    if (!userId) {
      console.log('❌ No userId provided to NotificationsPanel');
      return;
    }
    
    console.log('📢 NotificationsPanel mounted with userId:', userId);
    
    const fetchNotifications = async () => {
      try {
        console.log('🔄 Fetching notifications...');
        setIsLoading(true);
        const data = await notificationService.getUserNotifications(userId, 10);
        console.log('✅ Fetched notifications:', data);
        console.log(`   Total count: ${data?.length || 0}`);
        setNotifications(data || []);
        setHasUnread((data || []).some((n) => !n.is_read));
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Setup real-time listener for new notifications
    const subscription = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload);
          setNotifications(current => [payload.new, ...current]);
          setHasUnread(true);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const togglePanel = async (e) => {
    e.stopPropagation();
    setIsOpen((s) => !s);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderNotificationItem = (n) => (
    <li
      key={n.id}
      className={`p-3 flex gap-3 items-start hover:bg-gray-50 transition-colors cursor-pointer ${
        !n.is_read ? "bg-orange-50" : "bg-white"
      }`}
      onClick={async () => {
        if (!n.is_read) {
          try {
            await notificationService.markAsRead(n.id);
            setNotifications(prevNotifications =>
              prevNotifications.map(notif =>
                notif.id === n.id ? { ...notif, is_read: true } : notif
              )
            );
            setNotifications(prevNotifications => {
              setHasUnread(prevNotifications.some(notif => !notif.is_read));
              return prevNotifications;
            });
          } catch (err) {
            console.error('Error marking notification as read:', err);
          }
        }
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {n.actor_avatar ? (
          <img
            src={n.actor_avatar}
            alt={n.actor_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-700 font-medium text-sm">
              {getUserInitials(n.actor_name || n.commenter_name)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-bold">{n.actor_name || n.commenter_name || 'User'}</span>
          {n.type === 'comment_on_your_article' && <span className="text-gray-600 font-normal"> commented on</span>}
          {n.type === 'like_on_your_article' && <span className="text-gray-600 font-normal"> liked</span>}
          {n.type === 'like_on_article_you_liked' && <span className="text-gray-600 font-normal"> also liked</span>}
          {n.type === 'new_article' && <span className="text-gray-600 font-normal"> published a new article</span>}
          {n.type === 'comment_on_article_you_commented' && <span className="text-gray-600 font-normal"> commented on the article you have commented on</span>}
          {(n.type === 'comment_on_your_article' || n.type === 'like_on_your_article' || n.type === 'like_on_article_you_liked') && n.articles && <span className="text-gray-900 font-semibold"> &quot;{n.articles.title}&quot;</span>}
          {n.type === 'new_article' && n.articles && <span className="text-gray-900 font-semibold"> &quot;{n.articles.title}&quot;</span>}
          {n.type === 'comment_on_article_you_commented' && n.articles && <span className="text-gray-900 font-semibold"> &quot;{n.articles.title}&quot;</span>}
        </p>
        <p className="text-xs text-orange-500 font-medium mt-1">
          {formatTime(n.created_at)}
        </p>
      </div>
    </li>
  );

  // Dropdown variant (desktop - small popup)
  if (variant === "dropdown") {
    return (
      <div className="relative" ref={panelRef}>
        {/* Bell Button */}
        <button
          onClick={togglePanel}
          className="relative p-2 hover:opacity-80 transition"
        >
          <Bell className="w-6 h-6 text-gray-900" />
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Notifications Panel - Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-2xl rounded-lg border border-gray-200 z-50 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length > 0 ? (
              <>
                <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {notifications.slice(0, 3).map(renderNotificationItem)}
                </ul>
                {notifications.length > 3 && (
                  <div className="border-t border-gray-100 p-3 text-center">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = '/admin/notifications';
                      }}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      View all notifications ({notifications.length})
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fullscreen variant (mobile - side panel)
  return (
    <>
      {/* Bell Button */}
      <button
        onClick={togglePanel}
        className="relative p-2 hover:opacity-80 transition"
        ref={panelRef}
      >
        <Bell className="w-6 h-6 text-gray-900" />
        {hasUnread && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notifications Panel - Fullscreen Side Panel */}
      {isOpen && createPortal(
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 md:w-[400px] bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-b-0 ${
                      !n.is_read ? "bg-orange-50 hover:bg-orange-100" : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={async () => {
                      if (!n.is_read) {
                        try {
                          await notificationService.markAsRead(n.id);
                          setNotifications(prevNotifications =>
                            prevNotifications.map(notif =>
                              notif.id === n.id ? { ...notif, is_read: true } : notif
                            )
                          );
                        } catch (err) {
                          console.error('Error marking notification as read:', err);
                        }
                      }
                    }}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {n.actor_avatar || n.commenter_avatar ? (
                          <img
                            src={n.actor_avatar || n.commenter_avatar}
                            alt={n.actor_name || n.commenter_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-teal-700">
                              {getUserInitials(n.actor_name || n.commenter_name)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + Action */}
                        <p className="text-base text-gray-900">
                          <span className="font-bold">{n.actor_name || n.commenter_name || 'User'}</span>
                          <span className="text-gray-600 font-normal">
                            {n.type === 'comment_on_your_article' && ' Commented on the article you have commented on.'}
                            {n.type === 'like_on_your_article' && ' Liked your article.'}
                            {n.type === 'new_article' && ' Published new article.'}
                            {n.type === 'comment_on_article_you_commented' && ' Also commented on the article.'}
                          </span>
                        </p>

                        {/* Comment text if available */}
                        {n.comment_text && (
                          <p className="text-sm text-gray-700 italic mt-2 p-2 bg-gray-100 rounded border-l-2 border-orange-400">
                            &quot;{n.comment_text}&quot;
                          </p>
                        )}

                        {/* Article/Message */}
                        <p className="text-sm text-gray-600 mt-2">
                          {n.message}
                        </p>

                        {/* Time */}
                        <p className="text-xs text-orange-500 font-medium mt-2">
                          {formatTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-base font-medium text-gray-900 mb-1">No notifications yet</p>
                <p className="text-sm text-gray-400">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default NotificationsPanel;
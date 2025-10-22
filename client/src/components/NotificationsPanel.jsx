import React, { useEffect, useRef, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { notificationService } from "../services/notificationService";
import { supabase } from "../lib/supabase";

const NotificationsPanel = ({ userId }) => {
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
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Fetch notifications and setup real-time listener
  useEffect(() => {
    if (!userId) return;
    
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getUserNotifications(userId, 10);
        setNotifications(data || []);
        setHasUnread((data || []).some((n) => !n.is_read));
      } catch (err) {
        console.error("Error fetching notifications:", err);
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
          console.log('New notification received:', payload);
          setNotifications(current => [payload.new, ...current]);
          setHasUnread(true);
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const togglePanel = async (e) => {
    e.stopPropagation();
    setIsOpen((s) => !s);
    
    // Mark notifications as read when opening panel
    if (!isOpen && hasUnread) {
      try {
        await notificationService.markAllAsRead(userId);
        setHasUnread(false);
        setNotifications(prevNotifications => 
          prevNotifications.map(n => ({ ...n, is_read: true }))
        );
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell */}
      <button
        onClick={togglePanel}
        className="relative p-2 hover:opacity-80 transition"
      >
        <Bell className="w-6 h-6 text-gray-900" />
        {hasUnread && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div
          className={`
            absolute top-full mt-1
            left-2 right-2 md:left-auto md:right-0 md:w-80
            bg-white shadow-lg rounded-2xl border border-gray-100 z-50
            max-h-[80vh] overflow-y-auto
            ${window.innerWidth < 768 ? 'fixed inset-x-4 top-20' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-3 flex gap-3 items-start hover:bg-gray-50 ${
                    !n.is_read ? "bg-green-50/60" : ""
                  }`}
                >
                  {/* Use actor's avatar if available, fallback to initials avatar */}
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    {n.actor_name ? (
                      <span className="text-emerald-700 font-medium">
                        {n.actor_name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">U</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;

import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notificationService } from "../services/notificationService";

const NotificationsPanel = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
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

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getLatest(userId, 10);
        setNotifications(data || []);
        setHasUnread((data || []).some((n) => !n.read));
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, [userId]);

  const togglePanel = (e) => {
    e.stopPropagation();
    setIsOpen((s) => !s);
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
          `}
        >
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n, i) => (
                <li
                  key={i}
                  className={`p-3 flex gap-3 items-start hover:bg-gray-50 ${
                    !n.read ? "bg-green-50/60" : ""
                  }`}
                >
                  <img
                    src={n.commenter_avatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-snug">
                      {n.message || "You have a new notification"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{n.timeAgo}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            // Empty state: only "No notifications yet"
            <div className="p-6 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;

import React, { useState } from 'react';
import { Menu } from 'lucide-react';

export default function Notification({ sidebarOpen, setSidebarOpen }) {
  const [notifications] = useState([
    {
      id: 1,
      type: "comment",
      user: {
        name: "Jacob Lash",
        avatar: null,
      },
      article: "The Fascinating World of Cats: Why We Love Our Furry Friends",
      content: "I loved this article! It really explains why my cat is so independent yet loving. The purring section was super interesting.",
      time: "4 hours ago",
    },
    {
      id: 2,
      type: "like",
      user: {
        name: "Jacob Lash",
        avatar: null,
      },
      article: "The Fascinating World of Cats: Why We Love Our Furry Friends",
      content: "",
      time: "4 hours ago",
    },
  ]);

  const handleViewNotification = (notification) => {
    console.log('Viewing notification:', notification);
    alert(`Viewing: ${notification.article}`);
  };

  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 md:px-8 h-[56px] flex items-center justify-between">
        <h1 className="text-base md:text-lg font-semibold text-stone-800 text-center flex-1 lg:text-left lg:flex-none">Notification</h1>
        
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-stone-700" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id}>
              <div className="py-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                    {notification.user.avatar ? (
                      <img 
                        src={notification.user.avatar} 
                        alt={notification.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-stone-600">
                        {getUserInitials(notification.user.name)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-800 break-words">
                      <span className="font-semibold">{notification.user.name}</span>
                      {notification.type === "comment" ? " commented on " : " liked "}
                      <span className="font-normal">
                        your article: {notification.article}
                      </span>
                    </p>
                    
                    {notification.type === "comment" && notification.content && (
                      <p className="mt-2 text-sm text-stone-600 break-words">
                        {notification.content}
                      </p>
                    )}
                    
                    <p className="mt-2 text-xs text-orange-400">
                      {notification.time}
                    </p>
                  </div>
                </div>

                {/* View Button */}
                <button 
                  onClick={() => handleViewNotification(notification)}
                  className="text-xs md:text-sm font-medium text-stone-800 underline underline-offset-2 hover:text-stone-600 transition-colors flex-shrink-0"
                >
                  View
                </button>
              </div>
              
              {/* Divider - hide for last item */}
              {notification.id !== notifications[notifications.length - 1].id && (
                <hr className="border-t border-stone-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
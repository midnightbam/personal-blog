// src/components/UserDisplay.jsx
import React from 'react';

export const UserDisplay = ({ user, showAvatar = true, showUsername = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name?.charAt(0) || 'U'}&background=12B279&color=fff&size=200`}
          alt={user.name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${user.name?.charAt(0) || 'U'}&background=12B279&color=fff&size=200`;
          }}
        />
      )}
      <div className="flex flex-col">
        <span className={`${textSizeClasses[size]} font-medium text-gray-900`}>
          {user.name}
        </span>
        {showUsername && user.username && (
          <span className={`text-xs text-gray-500`}>
            @{user.username}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserDisplay;
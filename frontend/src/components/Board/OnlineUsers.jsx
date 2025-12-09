import React from 'react';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
];

const getColorForUser = (userId) => {
  return COLORS[userId % COLORS.length];
};

const OnlineUsers = ({ users, currentUserId }) => {
  const otherUsers = users.filter(u => u.user_id !== currentUserId);
  
  if (otherUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Online:</span>
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map((user) => (
          <div
            key={user.user_id}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-900 cursor-pointer transition-transform hover:scale-110 hover:z-10"
            style={{ backgroundColor: getColorForUser(user.user_id) }}
            title={user.user_name}
          >
            {user.user_name?.charAt(0).toUpperCase() || '?'}
          </div>
        ))}
        {otherUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-white text-xs font-bold border-2 border-gray-900">
            +{otherUsers.length - 5}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 ml-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="text-xs text-green-400">{otherUsers.length} online</span>
      </div>
    </div>
  );
};

export default OnlineUsers;


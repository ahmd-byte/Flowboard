import React from 'react';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
];

const getColorForUser = (userId) => {
  return COLORS[userId % COLORS.length];
};

const LiveCursors = ({ cursors }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          {/* Cursor SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            <path
              d="M5.5 3.21V20.8L11.3 14.99H19.5L5.5 3.21Z"
              fill={getColorForUser(parseInt(userId))}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          {/* User name label */}
          <div
            className="absolute left-4 top-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
            style={{ 
              backgroundColor: getColorForUser(parseInt(userId)),
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {cursor.user_name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveCursors;


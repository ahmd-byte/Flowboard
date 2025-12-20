import { useEffect, useRef, useState, useCallback } from 'react';
import useUserStore from '../store/userStore';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (boardId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { user } = useUserStore();
  
  const messageHandlers = useRef({});

  const connect = useCallback(() => {
    if (!boardId || !user) return;

    const wsUrl = `${WS_BASE_URL}/ws/boards/${boardId}?user_id=${user.id}&user_name=${encodeURIComponent(user.name || user.email)}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [boardId, user]);

  const handleMessage = useCallback((message) => {
    const { type, payload } = message;

    switch (type) {
      case 'users_list':
        setOnlineUsers(payload.users || []);
        break;
      
      case 'user_joined':
        setOnlineUsers(prev => [...prev.filter(u => u.user_id !== payload.user_id), payload]);
        break;
      
      case 'user_left':
        setOnlineUsers(prev => prev.filter(u => u.user_id !== payload.user_id));
        setCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[payload.user_id];
          return newCursors;
        });
        break;
      
      case 'cursor_move':
        setCursors(prev => ({
          ...prev,
          [payload.user_id]: {
            x: payload.x,
            y: payload.y,
            user_name: payload.user_name
          }
        }));
        break;
      
      default:
        // Call registered handlers for other message types
        if (messageHandlers.current[type]) {
          messageHandlers.current[type](payload);
        }
        break;
    }
  }, []);

  const sendMessage = useCallback((type, payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const sendCursorPosition = useCallback((x, y) => {
    sendMessage('cursor_move', { x, y });
  }, [sendMessage]);

  const registerHandler = useCallback((type, handler) => {
    messageHandlers.current[type] = handler;
    return () => {
      delete messageHandlers.current[type];
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    onlineUsers,
    cursors,
    sendMessage,
    sendCursorPosition,
    registerHandler
  };
};

export default useWebSocket;


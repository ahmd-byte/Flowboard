import { useEffect, useRef, useState, useCallback } from 'react';
import useUserStore from '../store/userStore';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

/**
 * Custom hook for managing WebSocket connection to a board.
 * 
 * Provides real-time collaboration features including:
 * - Connection status tracking
 * - Online users list
 * - Live cursor positions
 * - Message broadcasting and handling
 * 
 * @param {string|number} boardId - The ID of the board to connect to
 * @returns {Object} WebSocket connection state and methods
 * @returns {boolean} returns.isConnected - Whether the WebSocket is connected
 * @returns {Array} returns.onlineUsers - List of currently online users
 * @returns {Object} returns.cursors - Map of user IDs to cursor positions
 * @returns {Function} returns.sendMessage - Send a custom message through WebSocket
 * @returns {Function} returns.sendCursorPosition - Send cursor position (throttled)
 * @returns {Function} returns.registerHandler - Register a handler for specific message types
 * 
 * @example
 * const { isConnected, onlineUsers, cursors, sendCursorPosition } = useWebSocket(boardId);
 */
export const useWebSocket = (boardId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_DELAY = 1000;
  
  // Use selector to avoid unnecessary reconnections due to object reference changes
  const user = useUserStore(state => state.user);
  const userId = user?.id;
  const userName = user?.name || user?.email;
  
  const messageHandlers = useRef({});

  const connect = useCallback(() => {
    if (!boardId || !userId) return;

    // Get token from user store
    const token = useUserStore.getState().token;
    if (!token) {
      console.error('No authentication token available for WebSocket connection');
      return;
    }

    // Use token for authentication (backend will validate and extract user info)
    const wsUrl = `${WS_BASE_URL}/ws/boards/${boardId}?token=${encodeURIComponent(token)}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset on successful connection
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Exponential backoff with max attempts
        if (isMountedRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnection attempts reached');
        }
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
  }, [boardId, userId, userName]);

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

  // Throttle cursor position updates to reduce WebSocket traffic
  const cursorThrottleRef = useRef(null);
  const lastCursorPositionRef = useRef({ x: 0, y: 0 });
  const CURSOR_THROTTLE_MS = 50; // Update cursor position max once per 50ms

  const sendCursorPosition = useCallback((x, y) => {
    // Store latest position
    lastCursorPositionRef.current = { x, y };
    
    // If throttle timer is not set, send immediately and set timer
    if (!cursorThrottleRef.current) {
      sendMessage('cursor_move', { x, y });
      cursorThrottleRef.current = setTimeout(() => {
        cursorThrottleRef.current = null;
        // Send any pending position update
        const pending = lastCursorPositionRef.current;
        if (pending.x !== x || pending.y !== y) {
          sendMessage('cursor_move', pending);
        }
      }, CURSOR_THROTTLE_MS);
    }
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
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
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


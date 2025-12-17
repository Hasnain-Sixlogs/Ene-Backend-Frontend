// Socket.IO Hook for Chat
// Documentation: https://ljs0r9k3-8000.asse.devtunnels.ms/api-docs/#/

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';
import type {
  SocketMessage,
  SocketTypingData,
  SocketUserStatus,
  SocketNotification,
  SocketError,
  SocketJoinPayload,
  SocketSendMessagePayload,
  SocketTypingPayload,
  SocketMarkReadPayload,
} from '@/types/chat';

interface UseSocketOptions {
  onMessage?: (message: SocketMessage) => void;
  onTyping?: (data: SocketTypingData) => void;
  onUserStatus?: (data: SocketUserStatus) => void;
  onNotification?: (notification: SocketNotification) => void;
  onError?: (error: SocketError) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setSocketError('No authentication token found');
      return;
    }

    // Initialize socket connection
    const socket = io(API_BASE_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setSocketError(null);
      options.onConnect?.();
      
      // Notify server that user is online
      socket.emit('chat:online');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
      options.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      setSocketError(error.message);
      options.onError?.({ error: error.message });
    });

    // Chat events
    socket.on('chat:new_message', (message: SocketMessage) => {
      options.onMessage?.(message);
    });

    socket.on('chat:user_typing', (data: SocketTypingData) => {
      options.onTyping?.(data);
    });

    socket.on('chat:user_status', (data: SocketUserStatus) => {
      options.onUserStatus?.(data);
    });

    socket.on('chat:notification', (notification: SocketNotification) => {
      options.onNotification?.(notification);
    });

    socket.on('chat:error', (error: SocketError) => {
      console.error('Chat error:', error.error);
      setSocketError(error.error);
      options.onError?.(error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Only run once on mount

  // Join chat room
  const joinRoom = useCallback((payload: SocketJoinPayload) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot join room');
      return;
    }
    socketRef.current.emit('chat:join', payload);
  }, [isConnected]);

  // Send message
  const sendMessage = useCallback((payload: SocketSendMessagePayload) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not connected, cannot send message');
      return;
    }
    socketRef.current.emit('chat:send_message', payload);
  }, [isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((payload: SocketTypingPayload) => {
    if (!socketRef.current || !isConnected) {
      return;
    }
    socketRef.current.emit('chat:typing', payload);
  }, [isConnected]);

  // Mark messages as read
  const markAsRead = useCallback((payload: SocketMarkReadPayload) => {
    if (!socketRef.current || !isConnected) {
      return;
    }
    socketRef.current.emit('chat:mark_read', payload);
  }, [isConnected]);

  // Notify online status
  const notifyOnline = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      return;
    }
    socketRef.current.emit('chat:online');
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    socketError,
    joinRoom,
    sendMessage,
    sendTyping,
    markAsRead,
    notifyOnline,
  };
};


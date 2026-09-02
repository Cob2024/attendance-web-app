import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken, getApiBaseUrl } from '../services/apiClient';

const getSocketUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * React hook for Socket.io real-time connection.
 * Auto-connects on mount with JWT authentication and disconnects on unmount.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const token = getAuthToken();

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token || undefined,
      },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinCourse = useCallback((courseId: string) => {
    socketRef.current?.emit('join:course', courseId);
  }, []);

  const leaveCourse = useCallback((courseId: string) => {
    socketRef.current?.emit('leave:course', courseId);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  }, []);

  return { socket: socketRef, joinCourse, leaveCourse, on, off };
}

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * React hook for Socket.io real-time connection.
 * Auto-connects on mount and disconnects on unmount.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
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

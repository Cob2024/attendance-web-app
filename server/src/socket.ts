import { Server } from 'socket.io';

/**
 * Shared Socket.io instance.
 * Set by the server entry point after initialization.
 */
let io: Server | null = null;

export function setIO(ioInstance: Server) {
  io = ioInstance;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call setIO() first.');
  }
  return io;
}

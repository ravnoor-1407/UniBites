import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

export const socket = io(SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'), {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('⚡ Connected to UniBites Real-Time Socket Server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from Socket Server');
});

export default socket;

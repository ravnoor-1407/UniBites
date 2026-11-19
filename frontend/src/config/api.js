// Centralized API and WebSocket configuration
// Supports local development (via Vite proxy or direct), monolithic production deploy, and split cloud deploy (Render/Vercel)
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');

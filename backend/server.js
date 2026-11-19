const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { initSockets } = require('./sockets/socketHandler');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize real-time socket events
initSockets(io);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// API Routes (Single Source of Truth)
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    system: 'UniBites Core Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve static frontend assets in production / single-service deployment
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Root welcome route for API-only dev server
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head><title>UniBites API Server</title></head>
        <body style="font-family: sans-serif; background: #FBF6EC; color: #2B1B1F; padding: 40px; text-align: center;">
          <h1 style="color: #7A1F3D;">UniBites Smart Campus API</h1>
          <p>Single source of truth for food pre-ordering & queue management.</p>
          <p><a href="/api/health" style="color: #E3A82B;">Health Check</a> • <a href="/api/outlets" style="color: #E3A82B;">Outlets Directory</a></p>
        </body>
      </html>
    `);
  });
}

// 404 & Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 UniBites Server running on http://localhost:${PORT}`);
    console.log(`⚡ Socket.IO active for real-time kitchen & order sync`);
    console.log(`==================================================\n`);
  });
}

module.exports = { app, server };

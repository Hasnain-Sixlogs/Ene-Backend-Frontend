console.log('=== Starting Server ===');
console.log('Node version:', process.version);
console.log('Current directory:', __dirname);

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

console.log('Core modules loaded');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

let swaggerSpec;
try {
  swaggerSpec = require('./swagger/swagger.config');
  console.log('Swagger config loaded');
} catch (error) {
  console.error('Error loading swagger config:', error.message);
  swaggerSpec = { openapi: '3.0.0', info: { title: 'API', version: '1.0.0' }, paths: {} };
}

const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
console.log('All modules loaded');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available globally
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Every Nation Education API Documentation'
}));

// Database connection (non-blocking - don't wait for it)
let connectDB;
try {
  // Verify file exists first
  const fs = require('fs');
  const path = require('path');
  const dbPath = path.join(__dirname, 'config', 'database.js');
  
  if (!fs.existsSync(dbPath)) {
    console.error(`ERROR: database.js not found at ${dbPath}`);
    console.error('Current directory:', __dirname);
    try {
      const configDir = path.join(__dirname, 'config');
      if (fs.existsSync(configDir)) {
        console.error('Files in config:', fs.readdirSync(configDir).join(', '));
      } else {
        console.error('Config directory does not exist');
      }
    } catch (e) {
      console.error('Error reading config directory:', e.message);
    }
    // Create a dummy function so server can start
    connectDB = async () => {
      console.log('Database module not available - using dummy function');
      return null;
    };
  } else {
    console.log(`Found database.js at ${dbPath}`);
    connectDB = require('./config/database');
  }
} catch (error) {
  console.error('Error loading database module:', error);
  console.error('Error stack:', error.stack);
  // Create a dummy function so server can start
  connectDB = async () => {
    console.log('Database module failed to load - using dummy function');
    return null;
  };
}

// Start connection but don't block server startup
connectDB().catch(err => {
  console.error('Initial database connection failed:', err.message);
  console.log('Server will start anyway, database will retry in background');
});

// Import routes with error handling
let indexRoutes;
try {
  console.log('Loading routes...');
  indexRoutes = require('./routes/index.route');
  console.log('Routes loaded successfully');
  // API routes
  app.use('/api/v2', indexRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
  console.error('Error stack:', error.stack);
  // Create a dummy router so server can start
  // Express 5 doesn't support wildcard routes, use all() method instead
  app.use('/api/v2', (req, res, next) => {
    res.status(503).json({ error: 'Routes not loaded', message: error.message });
  });
  console.log('Using dummy routes - server will start but API will not work');
}

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});
// In your Express app
app.get("/my-ip", async (req, res) => {
  const fetch = require("node-fetch");
  const ip = await fetch("https://ifconfig.me").then(r => r.text());
  res.send(`Cloud Run sees IP: ${ip}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Setup Socket.IO chat handlers with error handling
try {
  console.log('Loading Socket.IO handlers...');
  const { setupUserAdminChatHandlers } = require('./socket/userAdminChatHandlers');
  setupUserAdminChatHandlers(io);
  console.log('Socket.IO handlers loaded');
} catch (error) {
  console.error('Error loading Socket.IO handlers:', error);
  console.error('Error stack:', error.stack);
  console.log('Server will continue without Socket.IO handlers');
}

const PORT = process.env.PORT || 8000;

console.log(`Attempting to start server on port ${PORT}...`);

// Listen on 0.0.0.0 to accept connections from Cloud Run
try {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Socket.IO is ready for real-time connections`);
    console.log(`✅ Swagger documentation available at https://ene-backend-454164503170.us-south1.run.app/api-docs`);
    console.log(`✅ MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    console.log('=== Server Started Successfully ===');
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

module.exports = { app, server, io };
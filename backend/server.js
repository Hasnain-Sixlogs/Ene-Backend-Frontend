const logger = require('./utils/logger');

logger.info('=== Starting Server ===');
logger.info('Node version:', process.version);
logger.info('Current directory:', __dirname);

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

logger.info('Core modules loaded');

// Load environment variables
dotenv.config();
logger.info('Environment variables loaded');

let swaggerSpec;
try {
  swaggerSpec = require('./swagger/swagger.config');
  logger.success('Swagger config loaded');
} catch (error) {
  logger.error('Error loading swagger config:', error.message);
  swaggerSpec = { openapi: '3.0.0', info: { title: 'API', version: '1.0.0' }, paths: {} };
}

const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
logger.info('All modules loaded');

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
    logger.error(`ERROR: database.js not found at ${dbPath}`);
    logger.error('Current directory:', __dirname);
    try {
      const configDir = path.join(__dirname, 'config');
      if (fs.existsSync(configDir)) {
        logger.error('Files in config:', fs.readdirSync(configDir).join(', '));
      } else {
        logger.error('Config directory does not exist');
      }
    } catch (e) {
      logger.error('Error reading config directory:', e.message);
    }
    // Create a dummy function so server can start
    connectDB = async () => {
      logger.warn('Database module not available - using dummy function');
      return null;
    };
  } else {
    logger.info(`Found database.js at ${dbPath}`);
    connectDB = require('./config/database');
  }
} catch (error) {
  logger.error('Error loading database module:', error);
  logger.error('Error stack:', error.stack);
  // Create a dummy function so server can start
  connectDB = async () => {
    logger.warn('Database module failed to load - using dummy function');
    return null;
  };
}

// Start connection but don't block server startup
connectDB().catch(err => {
  logger.error('Initial database connection failed:', err.message);
  logger.info('Server will start anyway, database will retry in background');
});

// Import routes with error handling
let indexRoutes;
try {
  logger.info('Loading routes...');
  indexRoutes = require('./routes/index.route');
  logger.success('Routes loaded successfully');
  // API routes
  app.use('/api/v2', indexRoutes);
} catch (error) {
  logger.error('Error loading routes:', error);
  logger.error('Error stack:', error.stack);
  // Create a dummy router so server can start
  // Express 5 doesn't support wildcard routes, use all() method instead
  app.use('/api/v2', (req, res, next) => {
    res.status(503).json({ error: 'Routes not loaded', message: error.message });
  });
  logger.warn('Using dummy routes - server will start but API will not work');
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

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.stack);
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
  logger.info('Loading Socket.IO handlers...');
  const { setupUserAdminChatHandlers } = require('./socket/userAdminChatHandlers');
  setupUserAdminChatHandlers(io);
  logger.success('Socket.IO handlers loaded');
} catch (error) {
  logger.error('Error loading Socket.IO handlers:', error);
  logger.error('Error stack:', error.stack);
  logger.warn('Server will continue without Socket.IO handlers');
}

const PORT = process.env.PORT || 8000;

logger.info(`Attempting to start server on port ${PORT}...`);

// Listen on 0.0.0.0 to accept connections from Cloud Run
try {
  server.listen(PORT, '0.0.0.0', () => {
    logger.success(`Server is running on port ${PORT}`);
    logger.success(`Socket.IO is ready for real-time connections`);
    logger.success(`Swagger documentation available at https://ene-backend-454164503170.us-south1.run.app/api-docs`);
    logger.success(`MongoDB connection status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    logger.success('=== Server Started Successfully ===');
  });

  server.on('error', (error) => {
    logger.error('Server error:', error);
    process.exit(1);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  logger.error('Error stack:', error.stack);
  process.exit(1);
}

module.exports = { app, server, io };
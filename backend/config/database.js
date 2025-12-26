const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ene:yJZ8z8kzshzKZq1c@35.223.203.51:27017/Everynationeducation?authSource=Everynationeducation&retryWrites=true&w=majority';
    
    logger.db('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    logger.db(`MongoDB Connected: ${conn.connection.db.databaseName}`);
    logger.success(`MongoDB Connected: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.warn('Server will continue to start, but database operations may fail');
    // Don't exit - let server start anyway
    // Retry connection in background
    setTimeout(() => {
      logger.db('Retrying MongoDB connection in background...');
      connectDB().catch(() => {
        logger.warn('Background retry failed, will retry again later');
      });
    }, 10000);
    return null;
  }
};

module.exports = connectDB;
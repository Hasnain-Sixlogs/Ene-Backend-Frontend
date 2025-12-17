const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://ene:yJZ8z8kzshzKZq1c@35.223.203.51:27017/Everynationeducation?authSource=Everynationeducation&retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Server will continue to start, but database operations may fail');
    // Don't exit - let server start anyway
    // Retry connection in background
    setTimeout(() => {
      console.log('Retrying MongoDB connection in background...');
      connectDB().catch(() => {
        console.log('Background retry failed, will retry again later');
      });
    }, 10000);
    return null;
  }
};

module.exports = connectDB;
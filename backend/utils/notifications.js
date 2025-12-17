const admin = require('firebase-admin');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                               path.join(__dirname, '../public/firbase_service_account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'every-nation-education-81e31'
      });
      
      firebaseInitialized = true;
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('Firebase service account file not found');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

// Send notification to user
const sendNotification = async (userId, message, title, type, data) => {
  try {
    initializeFirebase();

    if (!firebaseInitialized) {
      console.warn('Firebase not initialized, skipping notification');
      return { status: false, message: 'Firebase not initialized' };
    }

    // Get user FCM token
    const user = await User.findById(userId).select('fcm_token');
    
    if (!user || !user.fcm_token) {
      return { status: false, message: 'User FCM token not found' };
    }

    const notification = {
      body: message,
      title: title
    };

    const notificationType = {
      data: data || {},
      body: message,
      title: title,
      type: type
    };

    const messageData = {
      notification: notification,
      data: notificationType,
      token: user.fcm_token
    };

    // Send notification
    const response = await admin.messaging().send(messageData);
    
    console.log('FCM Response:', response);
    return { status: true, messageId: response };
  } catch (error) {
    console.error('FCM Error:', error);
    return { status: false, message: 'Notification sending failed', error: error.message };
  }
};

// Send notification to multiple users
const sendNotificationToMultiple = async (userIds, message, title, type, data) => {
  try {
    initializeFirebase();

    if (!firebaseInitialized) {
      console.warn('Firebase not initialized, skipping notification');
      return { status: false, message: 'Firebase not initialized' };
    }

    // Get users with FCM tokens
    const users = await User.find({
      _id: { $in: userIds },
      fcm_token: { $exists: true, $ne: null }
    }).select('fcm_token');

    if (users.length === 0) {
      return { status: false, message: 'No users with FCM tokens found' };
    }

    const tokens = users.map(user => user.fcm_token).filter(Boolean);

    const notification = {
      body: message,
      title: title
    };

    const notificationType = {
      data: data || {},
      body: message,
      title: title,
      type: type
    };

    const messageData = {
      notification: notification,
      data: notificationType
    };

    // Send to multiple tokens
    const response = await admin.messaging().sendEachForMulticast({
      ...messageData,
      tokens: tokens
    });

    console.log('FCM Multicast Response:', response);
    return { status: true, successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    console.error('FCM Multicast Error:', error);
    return { status: false, message: 'Notification sending failed', error: error.message };
  }
};

module.exports = {
  sendNotification,
  sendNotificationToMultiple
};
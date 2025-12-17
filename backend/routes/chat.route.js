const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Get all conversations
router.get('/conversations', chatController.getConversations);

// Get messages for a specific conversation
router.get('/messages/:userId', chatController.getMessages);

// Get chat statistics (admin only)
router.get('/stats', chatController.getChatStats);

// Mark messages as read
router.put('/messages/read/:userId', chatController.markMessagesAsRead);

// Delete a message
router.delete('/messages/:messageId', chatController.deleteMessage);

// Test endpoint (for testing chat functionality)
router.post('/test/send-message', chatController.testSendMessage);

module.exports = router;


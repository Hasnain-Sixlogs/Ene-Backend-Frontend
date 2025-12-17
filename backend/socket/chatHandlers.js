const adminChatService = require('../services/adminChatService');
const userPasterChatService = require('../services/userPasterChatService');
const communityChatService = require('../services/communityChatService');
const User = require('../models/user.model');

// Store active users and their socket IDs
const activeUsers = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

// Socket.IO chat event handlers
const setupChatHandlers = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user connection
    activeUsers.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // ============================================
    // ADMIN CHAT HANDLERS
    // ============================================

    // User sends message to admin
    socket.on('admin:send_message', async (data) => {
      try {
        const { message } = data;
        const result = await adminChatService.sendMessageToAdmin(socket.userId, message);

        if (result.success) {
          // Emit to user
          socket.emit('admin:message_sent', result.message);
          
          // Emit to all admin users (you may want to filter by admin role)
          io.to('admin_room').emit('admin:new_message', {
            userId: socket.userId,
            message: result.message
          });
        } else {
          socket.emit('admin:error', { error: result.error });
        }
      } catch (error) {
        socket.emit('admin:error', { error: error.message });
      }
    });

    // Admin sends message to user
    socket.on('admin:send_to_user', async (data) => {
      try {
        const { userId, message } = data;
        
        // Verify user is admin
        const user = await User.findById(socket.userId);
        if (!user || !user.is_admin) {
          return socket.emit('admin:error', { error: 'Unauthorized' });
        }

        const result = await adminChatService.adminSendMessage(userId, message, socket.userId);

        if (result.success) {
          // Emit to specific user
          io.to(`user_${userId}`).emit('admin:new_message', result.message);
          
          // Emit confirmation to admin
          socket.emit('admin:message_sent', result.message);
        } else {
          socket.emit('admin:error', { error: result.error });
        }
      } catch (error) {
        socket.emit('admin:error', { error: error.message });
      }
    });

    // Join admin room
    socket.on('admin:join_room', async () => {
      try {
        const user = await User.findById(socket.userId);
        if (user && user.is_admin) {
          socket.join('admin_room');
          socket.emit('admin:joined_room');
        } else {
          socket.emit('admin:error', { error: 'Unauthorized' });
        }
      } catch (error) {
        socket.emit('admin:error', { error: error.message });
      }
    });

    // Mark admin messages as read
    socket.on('admin:mark_read', async () => {
      try {
        await adminChatService.markAsRead(socket.userId);
        socket.emit('admin:messages_read');
      } catch (error) {
        socket.emit('admin:error', { error: error.message });
      }
    });

    // ============================================
    // USER-PASTER CHAT HANDLERS
    // ============================================

    // Send message between user and paster
    socket.on('paster:send_message', async (data) => {
      try {
        const { pasterId, message } = data;
        const result = await userPasterChatService.sendMessage(
          socket.userId,
          pasterId,
          message,
          socket.userId
        );

        if (result.success) {
          // Emit to sender
          socket.emit('paster:message_sent', result.message);
          
          // Emit to receiver
          io.to(`user_${pasterId}`).emit('paster:new_message', result.message);
        } else {
          socket.emit('paster:error', { error: result.error });
        }
      } catch (error) {
        socket.emit('paster:error', { error: error.message });
      }
    });

    // Join chat room with paster
    socket.on('paster:join_chat', async (data) => {
      try {
        const { pasterId } = data;
        const roomId = `chat_${socket.userId}_${pasterId}`;
        socket.join(roomId);
        
        // Mark messages as read
        await userPasterChatService.markAsRead(socket.userId, pasterId, socket.userId);
        
        socket.emit('paster:joined_chat', { pasterId });
      } catch (error) {
        socket.emit('paster:error', { error: error.message });
      }
    });

    // Mark messages as read
    socket.on('paster:mark_read', async (data) => {
      try {
        const { pasterId } = data;
        await userPasterChatService.markAsRead(socket.userId, pasterId, socket.userId);
        socket.emit('paster:messages_read');
      } catch (error) {
        socket.emit('paster:error', { error: error.message });
      }
    });

    // Block chat
    socket.on('paster:block_chat', async (data) => {
      try {
        const { pasterId } = data;
        const result = await userPasterChatService.blockChat(
          socket.userId,
          pasterId,
          socket.userId
        );
        
        if (result.success) {
          socket.emit('paster:chat_blocked', result);
          io.to(`user_${pasterId}`).emit('paster:chat_blocked_by_other');
        } else {
          socket.emit('paster:error', { error: result.error });
        }
      } catch (error) {
        socket.emit('paster:error', { error: error.message });
      }
    });

    // Report chat
    socket.on('paster:report_chat', async (data) => {
      try {
        const { pasterId } = data;
        const result = await userPasterChatService.reportChat(
          socket.userId,
          pasterId,
          socket.userId
        );
        
        socket.emit('paster:chat_reported', result);
      } catch (error) {
        socket.emit('paster:error', { error: error.message });
      }
    });

    // ============================================
    // COMMUNITY CHAT HANDLERS
    // ============================================

    // Send community message
    socket.on('community:send_message', async (data) => {
      try {
        const { communityId, message, mediaPath, type } = data;
        const result = await communityChatService.sendCommunityMessage(
          communityId,
          socket.userId,
          message,
          mediaPath,
          type || 'text'
        );

        if (result.success) {
          // Broadcast to all users in community
          io.to(`community_${communityId}`).emit('community:new_message', result.message);
        } else {
          socket.emit('community:error', { error: result.error });
        }
      } catch (error) {
        socket.emit('community:error', { error: error.message });
      }
    });

    // Join community room
    socket.on('community:join', (data) => {
      const { communityId } = data;
      socket.join(`community_${communityId}`);
      socket.emit('community:joined', { communityId });
    });

    // Leave community room
    socket.on('community:leave', (data) => {
      const { communityId } = data;
      socket.leave(`community_${communityId}`);
      socket.emit('community:left', { communityId });
    });

    // ============================================
    // TYPING INDICATORS
    // ============================================

    // Typing indicator for admin chat
    socket.on('admin:typing', (data) => {
      io.to('admin_room').emit('admin:user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Typing indicator for paster chat
    socket.on('paster:typing', (data) => {
      const { pasterId, isTyping } = data;
      io.to(`user_${pasterId}`).emit('paster:user_typing', {
        userId: socket.userId,
        isTyping: isTyping
      });
    });

    // Typing indicator for community
    socket.on('community:typing', (data) => {
      const { communityId, isTyping } = data;
      socket.to(`community_${communityId}`).emit('community:user_typing', {
        userId: socket.userId,
        isTyping: isTyping
      });
    });

    // ============================================
    // PRESENCE HANDLERS
    // ============================================

    // User online status
    socket.on('user:online', () => {
      io.emit('user:status', {
        userId: socket.userId,
        status: 'online'
      });
    });

    // ============================================
    // DISCONNECT HANDLER
    // ============================================

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove from active users
      activeUsers.delete(socket.userId);
      socketUsers.delete(socket.id);

      // Notify others
      io.emit('user:status', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};

// Helper function to get socket ID by user ID
const getSocketIdByUserId = (userId) => {
  return activeUsers.get(userId);
};

// Helper function to get user ID by socket ID
const getUserIdBySocketId = (socketId) => {
  return socketUsers.get(socketId);
};

module.exports = {
  setupChatHandlers,
  getSocketIdByUserId,
  getUserIdBySocketId
};
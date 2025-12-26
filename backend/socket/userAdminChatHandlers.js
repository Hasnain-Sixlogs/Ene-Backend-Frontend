const mongoose = require('mongoose');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const { getFileUrl } = require('../utils/fileUpload');
const logger = require('../utils/logger');

// Store active users and their socket IDs
const activeUsers = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

/**
 * Generate consistent room ID for user-admin chat
 */
const getRoomId = (userId, adminId) => {
  const ids = [userId.toString(), adminId.toString()].sort();
  return `chat_${ids[0]}_${ids[1]}`;
};

/**
 * Setup Socket.IO handlers for user-admin chat
 */
const setupUserAdminChatHandlers = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization;

      logger.debug("Socket authentication token received:", token);
      logger.debug("Socket authentication token received:", socket.handshake.auth);
      logger.debug("Socket authentication token received:", socket.handshake.headers);
      logger.debug("Socket authentication token received:", socket.handshake.headers.authorization);
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      logger.debug("Socket authentication token received");
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      logger.debug("User found:", user?._id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      logger.debug("User deleted_at status:", user.deleted_at);
      if (user.deleted_at) {
        return next(new Error('Authentication error: User account is deleted'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      socket.userRole = user.role;
      logger.debug("Socket user role:", socket.userRole);
      next();
    } catch (error) {
      logger.error("Socket authentication error:", error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.socket(`User connected: ${socket.userId} (${socket.userRole})`);

    // Store user connection
    activeUsers.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Join user's personal room for notifications
    socket.join(`user_${socket.userId}`);

    // If admin, join admin room
    if (socket.userRole === 'admin') {
      socket.join('admin_room');
      logger.socket(`Admin ${socket.userId} joined admin room`);
    }

    // ============================================
    // JOIN CHAT ROOM
    // ============================================
    socket.on('chat:join', async (data) => {
      try {
        const { userId } = data;

        // Validation
        if (!userId) {
          return socket.emit('chat:error', {
            error: 'User ID is required',
          });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return socket.emit('chat:error', {
            error: 'Invalid user ID',
          });
        }

        // Determine participants
        let user_id, admin_id;
        if (socket.userRole === 'admin') {
          // Admin joining conversation with a user
          user_id = userId;
          admin_id = socket.userId;

          // Verify the other user exists and is not an admin
          const otherUser = await User.findById(userId);
          if (!otherUser || otherUser.role === 'admin') {
            return socket.emit('chat:error', {
              error: 'Invalid user or user is an admin',
            });
          }
        } else {
          // User joining conversation with admin
          user_id = socket.userId;
          admin_id = userId;

          // Verify the other user is an admin
          const otherUser = await User.findById(userId);
          if (!otherUser || otherUser.role !== 'admin') {
            return socket.emit('chat:error', {
              error: 'You can only chat with admins',
            });
          }
        }

        // Join the chat room
        const roomId = getRoomId(user_id, admin_id);
        socket.join(roomId);

        // Mark messages as read
        const filter =
          socket.userRole === 'admin'
            ? {
                user_id,
                admin_id,
                sender_role: 'user',
                is_read: false,
                deleted_at: null,
              }
            : {
                user_id,
                admin_id,
                sender_role: 'admin',
                is_read: false,
                deleted_at: null,
              };

        await Chat.updateMany(filter, {
          $set: {
            is_read: true,
            read_at: new Date(),
          },
        });

        socket.emit('chat:joined', {
          roomId,
          userId: socket.userRole === 'admin' ? user_id : admin_id,
        });
      } catch (error) {
        logger.error('Join chat error:', error);
        socket.emit('chat:error', {
          error: error.message || 'Error joining chat',
        });
      }
    });

    // ============================================
    // SEND MESSAGE
    // ============================================
    socket.on('chat:send_message', async (data) => {
      try {
        const { userId, message, attachment, attachment_type } = data;

        // Validation
        if (!userId) {
          return socket.emit('chat:error', {
            error: 'User ID is required',
          });
        }

        if (!message || message.trim().length === 0) {
          return socket.emit('chat:error', {
            error: 'Message cannot be empty',
          });
        }

        if (message.length > 5000) {
          return socket.emit('chat:error', {
            error: 'Message is too long (max 5000 characters)',
          });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return socket.emit('chat:error', {
            error: 'Invalid user ID',
          });
        }

        // Determine participants
        let user_id, admin_id;
        if (socket.userRole === 'admin') {
          user_id = userId;
          admin_id = socket.userId;

          // Verify the other user exists and is not an admin
          const otherUser = await User.findById(userId);
          if (!otherUser || otherUser.role === 'admin') {
            return socket.emit('chat:error', {
              error: 'Invalid user or user is an admin',
            });
          }
        } else {
          user_id = socket.userId;
          admin_id = userId;

          // Verify the other user is an admin
          const otherUser = await User.findById(userId);
          if (!otherUser || otherUser.role !== 'admin') {
            return socket.emit('chat:error', {
              error: 'You can only chat with admins',
            });
          }
        }

        // Create message in database
        const chatMessage = new Chat({
          user_id,
          admin_id,
          message: message.trim(),
          sender_id: socket.userId,
          sender_role: socket.userRole,
          attachment: attachment || null,
          attachment_type: attachment_type || null,
          is_read: false,
        });

        await chatMessage.save();

        // Populate sender information
        await chatMessage.populate('sender_id', 'name email profile');

        // Convert profile image path to signed URL
        let senderProfileUrl = chatMessage.sender_id.profile || null;
        if (senderProfileUrl) {
          try {
            senderProfileUrl = await getFileUrl(senderProfileUrl);
          } catch (urlError) {
            logger.error("Error getting file URL:", urlError);
            // Keep original path if URL generation fails
          }
        }

        // Get room ID
        const roomId = getRoomId(user_id, admin_id);

        // Emit to all users in the room
        io.to(roomId).emit('chat:new_message', {
          _id: chatMessage._id,
          user_id: chatMessage.user_id,
          admin_id: chatMessage.admin_id,
          message: chatMessage.message,
          sender_id: {
            _id: chatMessage.sender_id._id,
            name: chatMessage.sender_id.name,
            email: chatMessage.sender_id.email,
            profile: senderProfileUrl,
          },
          sender_role: chatMessage.sender_role,
          attachment: chatMessage.attachment,
          attachment_type: chatMessage.attachment_type,
          is_read: chatMessage.is_read,
          createdAt: chatMessage.createdAt,
          updatedAt: chatMessage.updatedAt,
        });

        // If admin sent message, notify user
        if (socket.userRole === 'admin') {
          io.to(`user_${user_id}`).emit('chat:notification', {
            type: 'new_message',
            from: {
              _id: socket.user._id,
              name: socket.user.name,
            },
            message: chatMessage.message.substring(0, 100), // Preview
          });
        } else {
          // If user sent message, notify all admins
          io.to('admin_room').emit('chat:notification', {
            type: 'new_message',
            from: {
              _id: socket.user._id,
              name: socket.user.name,
            },
            userId: user_id,
            message: chatMessage.message.substring(0, 100), // Preview
          });
        }

        // Confirm message sent
        socket.emit('chat:message_sent', {
          _id: chatMessage._id,
          message: chatMessage.message,
        });
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('chat:error', {
          error: error.message || 'Error sending message',
        });
      }
    });

    // ============================================
    // TYPING INDICATOR
    // ============================================
    socket.on('chat:typing', (data) => {
      try {
        const { userId, isTyping } = data;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          return;
        }

        // Determine participants
        let user_id, admin_id;
        if (socket.userRole === 'admin') {
          user_id = userId;
          admin_id = socket.userId;
        } else {
          user_id = socket.userId;
          admin_id = userId;
        }

        const roomId = getRoomId(user_id, admin_id);

        // Emit typing indicator to other users in room
        socket.to(roomId).emit('chat:user_typing', {
          userId: socket.userId,
          userName: socket.user.name,
          isTyping: isTyping || false,
        });
      } catch (error) {
        logger.error('Typing indicator error:', error);
      }
    });

    // ============================================
    // MARK MESSAGES AS READ
    // ============================================
    socket.on('chat:mark_read', async (data) => {
      try {
        const { userId } = data;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          return socket.emit('chat:error', {
            error: 'Invalid user ID',
          });
        }

        // Determine participants
        let user_id, admin_id;
        if (socket.userRole === 'admin') {
          user_id = userId;
          admin_id = socket.userId;
        } else {
          user_id = socket.userId;
          admin_id = userId;
        }

        // Mark messages as read
        const filter =
          socket.userRole === 'admin'
            ? {
                user_id,
                admin_id,
                sender_role: 'user',
                is_read: false,
                deleted_at: null,
              }
            : {
                user_id,
                admin_id,
                sender_role: 'admin',
                is_read: false,
                deleted_at: null,
              };

        await Chat.updateMany(filter, {
          $set: {
            is_read: true,
            read_at: new Date(),
          },
        });

        const roomId = getRoomId(user_id, admin_id);
        io.to(roomId).emit('chat:messages_read', {
          userId: socket.userId,
        });

        socket.emit('chat:read_confirmed');
      } catch (error) {
        logger.error('Mark read error:', error);
        socket.emit('chat:error', {
          error: error.message || 'Error marking messages as read',
        });
      }
    });

    // ============================================
    // USER ONLINE STATUS
    // ============================================
    socket.on('chat:online', () => {
      // Notify relevant users about online status
      if (socket.userRole === 'admin') {
        // Admin is online - notify all users they're chatting with
        io.emit('chat:user_status', {
          userId: socket.userId,
          status: 'online',
        });
      } else {
        // User is online - notify admins
        io.to('admin_room').emit('chat:user_status', {
          userId: socket.userId,
          status: 'online',
        });
      }
    });

    // ============================================
    // DISCONNECT HANDLER
    // ============================================
    socket.on('disconnect', () => {
      logger.socket(`User disconnected: ${socket.userId}`);

      // Remove from active users
      activeUsers.delete(socket.userId);
      socketUsers.delete(socket.id);

      // Notify about offline status
      if (socket.userRole === 'admin') {
        io.emit('chat:user_status', {
          userId: socket.userId,
          status: 'offline',
        });
      } else {
        io.to('admin_room').emit('chat:user_status', {
          userId: socket.userId,
          status: 'offline',
        });
      }
    });
  });

  return io;
};

// Helper functions
const getSocketIdByUserId = (userId) => {
  return activeUsers.get(userId);
};

const getUserIdBySocketId = (socketId) => {
  return socketUsers.get(socketId);
};

const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};

module.exports = {
  setupUserAdminChatHandlers,
  getSocketIdByUserId,
  getUserIdBySocketId,
  getOnlineUsers,
  getRoomId,
};


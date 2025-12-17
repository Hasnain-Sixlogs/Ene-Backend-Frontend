const mongoose = require('mongoose');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

/**
 * Get all conversations for a user (user or admin)
 * GET /api/v2/chat/conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log(req.user);
    console.log(userId);
    console.log(userRole);
    let conversations = [];

    if (userRole === 'admin') {
      // Admin sees all conversations with users
      conversations = await Chat.aggregate([
        {
          $match: {
            admin_id: new mongoose.Types.ObjectId(userId),
            deleted_at: null,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: '$user_id',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [{ $eq: ['$is_read', false] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            _id: 0,
            userId: '$user._id',
            userName: '$user.name',
            userEmail: '$user.email',
            userProfile: '$user.profile',
            lastMessage: {
              _id: '$lastMessage._id',
              message: '$lastMessage.message',
              sender_id: '$lastMessage.sender_id',
              sender_role: '$lastMessage.sender_role',
              createdAt: '$lastMessage.createdAt',
            },
            unreadCount: 1,
          },
        },
        {
          $sort: { 'lastMessage.createdAt': -1 },
        },
      ]);
    } else {
      // User sees conversation with admin
      conversations = await Chat.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(userId),
            deleted_at: null,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: '$admin_id',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { $eq: ['$is_read', false] },
                  { $cond: [{ $eq: ['$sender_role', 'admin'] }, 1, 0] },
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'admin',
          },
        },
        {
          $unwind: '$admin',
        },
        {
          $project: {
            _id: 0,
            adminId: '$admin._id',
            adminName: '$admin.name',
            adminEmail: '$admin.email',
            adminProfile: '$admin.profile',
            lastMessage: {
              _id: '$lastMessage._id',
              message: '$lastMessage.message',
              sender_id: '$lastMessage.sender_id',
              sender_role: '$lastMessage.sender_role',
              createdAt: '$lastMessage.createdAt',
            },
            unreadCount: 1,
          },
        },
        {
          $sort: { 'lastMessage.createdAt': -1 },
        },
      ]);
    }

    res.json({
      success: true,
      message: 'Conversations retrieved successfully',
      data: {
        conversations,
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get messages for a specific conversation
 * GET /api/v2/chat/messages/:userId
 */
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Determine the other participant
    let user_id, admin_id;
    if (currentUserRole === 'admin') {
      // Admin viewing conversation with a user
      user_id = userId;
      admin_id = currentUserId;
    } else {
      // User viewing conversation with admin
      user_id = currentUserId;
      admin_id = userId;

      // Verify the other user is an admin
      const otherUser = await User.findById(userId);
      if (!otherUser || otherUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only chat with admins',
        });
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get messages
    const messages = await Chat.find({
      user_id,
      admin_id,
      deleted_at: null,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('sender_id', 'name email profile')
      .lean();

    // Reverse to show oldest first
    messages.reverse();

    // Get total count
    const total = await Chat.countDocuments({
      user_id,
      admin_id,
      deleted_at: null,
    });

    // Mark messages as read if current user is the receiver
    const unreadMessageIds = messages
      .filter(
        (msg) =>
          !msg.is_read &&
          msg.sender_id._id.toString() !== currentUserId.toString()
      )
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      await Chat.updateMany(
        { _id: { $in: unreadMessageIds } },
        {
          $set: {
            is_read: true,
            read_at: new Date(),
          },
        }
      );
    }

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get chat statistics (for admin dashboard)
 * GET /api/v2/chat/stats
 */
const getChatStats = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access chat statistics',
      });
    }

    const totalChats = await Chat.distinct('user_id', {
      deleted_at: null,
    }).then((userIds) => userIds.length);

    // Get online users count from socket handler
    const { getOnlineUsers } = require('../socket/userAdminChatHandlers');
    const onlineUserIds = getOnlineUsers();
    const onlineUsers = onlineUserIds.length;

    const unreadMessages = await Chat.countDocuments({
      admin_id: req.user._id,
      is_read: false,
      sender_role: 'user',
      deleted_at: null,
    });

    const respondedChats = await Chat.distinct('user_id', {
      admin_id: req.user._id,
      sender_role: 'admin',
      deleted_at: null,
    }).then((userIds) => userIds.length);

    res.json({
      success: true,
      message: 'Chat statistics retrieved successfully',
      data: {
        totalChats,
        onlineUsers,
        unreadMessages,
        respondedChats,
      },
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving chat statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Mark messages as read
 * PUT /api/v2/chat/messages/read/:userId
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserRole = req.user.role;
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    let filter;
    if (currentUserRole === 'admin') {
      filter = {
        user_id: userId,
        admin_id: currentUserId,
        sender_role: 'user',
        is_read: false,
        deleted_at: null,
      };
    } else {
      filter = {
        user_id: currentUserId,
        admin_id: userId,
        sender_role: 'admin',
        is_read: false,
        deleted_at: null,
      };
    }

    const result = await Chat.updateMany(filter, {
      $set: {
        is_read: true,
        read_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: {
        updatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Delete a message
 * DELETE /api/v2/chat/messages/:messageId
 */
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID',
      });
    }

    const message = await Chat.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete their own message
    if (message.sender_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Soft delete
    message.deleted_at = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Test endpoint - Create a test message (for testing only)
 * POST /api/v2/chat/test/send-message
 */
const testSendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const currentUserId = req.user._id;
    const currentUserRole = req.user.role;

    // Validation
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and message',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Determine participants
    let user_id, admin_id;
    if (currentUserRole === 'admin') {
      // Admin sending to user
      user_id = userId;
      admin_id = currentUserId;

      // Verify the other user exists and is not an admin
      const otherUser = await User.findById(userId);
      if (!otherUser || otherUser.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid user or user is an admin',
        });
      }
    } else {
      // User sending to admin
      user_id = currentUserId;
      admin_id = userId;

      // Verify the other user is an admin
      const otherUser = await User.findById(userId);
      if (!otherUser || otherUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'You can only chat with admins',
        });
      }
    }

    // Create message
    const chatMessage = new Chat({
      user_id,
      admin_id,
      message: message.trim(),
      sender_id: currentUserId,
      sender_role: currentUserRole,
      is_read: false,
    });

    await chatMessage.save();
    await chatMessage.populate('sender_id', 'name email profile');

    // Get Socket.IO instance and emit to room
    const io = req.app.get('io');
    if (io) {
      const { getRoomId } = require('../socket/userAdminChatHandlers');
      const roomId = getRoomId(user_id, admin_id);
      
      io.to(roomId).emit('chat:new_message', {
        _id: chatMessage._id,
        user_id: chatMessage.user_id,
        admin_id: chatMessage.admin_id,
        message: chatMessage.message,
        sender_id: {
          _id: chatMessage.sender_id._id,
          name: chatMessage.sender_id.name,
          email: chatMessage.sender_id.email,
          profile: chatMessage.sender_id.profile,
        },
        sender_role: chatMessage.sender_role,
        attachment: chatMessage.attachment,
        attachment_type: chatMessage.attachment_type,
        is_read: chatMessage.is_read,
        createdAt: chatMessage.createdAt,
        updatedAt: chatMessage.updatedAt,
      });
    }

    res.json({
      success: true,
      message: 'Test message sent successfully',
      data: {
        message: {
          _id: chatMessage._id,
          user_id: chatMessage.user_id,
          admin_id: chatMessage.admin_id,
          message: chatMessage.message,
          sender_id: {
            _id: chatMessage.sender_id._id,
            name: chatMessage.sender_id.name,
            email: chatMessage.sender_id.email,
            profile: chatMessage.sender_id.profile,
          },
          sender_role: chatMessage.sender_role,
          is_read: chatMessage.is_read,
          createdAt: chatMessage.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Test send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  getChatStats,
  markMessagesAsRead,
  deleteMessage,
  testSendMessage,
};


require('dotenv').config();
const mongoose = require('mongoose');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ene_backend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedChat = async () => {
  try {
    await connectDB();

    // Find or get first user and admin
    const user = await User.findOne({ role: 'user', deleted_at: null });
    const admin = await User.findOne({ role: 'admin', deleted_at: null });

    if (!user) {
      console.log('✗ No user found. Please create a user first.');
      process.exit(1);
    }

    if (!admin) {
      console.log('✗ No admin found. Please create an admin first.');
      process.exit(1);
    }

    console.log(`\n✓ Found User: ${user.name} (${user._id})`);
    console.log(`✓ Found Admin: ${admin.name} (${admin._id})\n`);

    // Check if conversation already exists
    const existingChat = await Chat.findOne({
      user_id: user._id,
      admin_id: admin._id,
      deleted_at: null,
    });

    if (existingChat) {
      console.log('⚠ Conversation already exists. Adding more messages...\n');
    } else {
      console.log('✓ Creating new conversation...\n');
    }

    // Sample messages
    const messages = [
      {
        user_id: user._id,
        admin_id: admin._id,
        message: 'Hello Pastor, I hope you\'re doing well!',
        sender_id: user._id,
        sender_role: 'user',
        is_read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        user_id: user._id,
        admin_id: admin._id,
        message: 'Hello! I\'m doing great, thank you. How can I help you today?',
        sender_id: admin._id,
        sender_role: 'admin',
        is_read: true,
        read_at: new Date(Date.now() - 28 * 60 * 1000),
        createdAt: new Date(Date.now() - 28 * 60 * 1000), // 28 minutes ago
      },
      {
        user_id: user._id,
        admin_id: admin._id,
        message: 'I wanted to ask about the upcoming prayer meeting schedule.',
        sender_id: user._id,
        sender_role: 'user',
        is_read: true,
        read_at: new Date(Date.now() - 25 * 60 * 1000),
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      },
      {
        user_id: user._id,
        admin_id: admin._id,
        message: 'Of course! We have prayer meetings every Wednesday at 7 PM and Saturday mornings at 6 AM.',
        sender_id: admin._id,
        sender_role: 'admin',
        is_read: true,
        read_at: new Date(Date.now() - 22 * 60 * 1000),
        createdAt: new Date(Date.now() - 22 * 60 * 1000), // 22 minutes ago
      },
      {
        user_id: user._id,
        admin_id: admin._id,
        message: 'Thank you for the prayer support!',
        sender_id: user._id,
        sender_role: 'user',
        is_read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
    ];

    // Insert messages
    const insertedMessages = await Chat.insertMany(messages);

    console.log(`✓ Successfully created ${insertedMessages.length} messages\n`);
    console.log('Messages created:');
    insertedMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.sender_role.toUpperCase()}] ${msg.message.substring(0, 50)}...`);
    });

    console.log(`\n✓ Conversation seeded successfully!`);
    console.log(`\nYou can now test the chat with:`);
    console.log(`  - User ID: ${user._id}`);
    console.log(`  - Admin ID: ${admin._id}`);
    console.log(`\nTest endpoints:`);
    console.log(`  GET /api/v2/chat/conversations`);
    console.log(`  GET /api/v2/chat/messages/${admin._id} (as user)`);
    console.log(`  GET /api/v2/chat/messages/${user._id} (as admin)`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding chat:', error);
    process.exit(1);
  }
};

// Run seed
seedChat();


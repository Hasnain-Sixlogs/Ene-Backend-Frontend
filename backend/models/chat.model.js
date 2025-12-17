const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    // Participants: one user and one admin
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Message content
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Sender information
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender_role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    // Message status
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
      default: null,
    },
    // Optional: file attachments
    attachment: {
      type: String, // URL to file
      default: null,
    },
    attachment_type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', null],
      default: null,
    },
    // Soft delete
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying of conversations
chatSchema.index({ user_id: 1, admin_id: 1, createdAt: -1 });
chatSchema.index({ user_id: 1, is_read: 1 });
chatSchema.index({ admin_id: 1, is_read: 1 });
chatSchema.index({ sender_id: 1, createdAt: -1 });

// Virtual for room ID (consistent room naming)
chatSchema.virtual('room_id').get(function () {
  // Sort IDs to ensure consistent room name regardless of who created it
  const ids = [this.user_id.toString(), this.admin_id.toString()].sort();
  return `chat_${ids[0]}_${ids[1]}`;
});

// Ensure virtuals are included in JSON
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;


const mongoose = require('mongoose');

const followUpRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  contact: {
    type: String,
    default: null // Combined contact info
  },
  type: {
    type: String,
    enum: ['New Visitor', 'Prayer Request', 'Counseling', 'Membership', 'Baptism', 'Other'],
    default: 'Other'
  },
  assigned_to: {
    type: String,
    default: null // Name of pastor/admin assigned
  },
  assigned_to_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  due_date: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  description: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

const FollowUpRequest = mongoose.model('FollowUpRequest', followUpRequestSchema);
module.exports = FollowUpRequest;


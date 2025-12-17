const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  church_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dial_code: {
    type: String,
    default: null
  },
  mobile_number: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

const PrayerRequest = mongoose.model('PrayerRequest', prayerRequestSchema);
module.exports = PrayerRequest;


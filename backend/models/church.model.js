const mongoose = require('mongoose');

const churchSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional for admin-created churches
    default: null
  },
  name: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  place_id: {
    type: String,
    default: null
  },
  is_availability: {
    type: Number,
    default: 1
  },
  church_status: {
    type: Number,
    default: 1
  },
  approve_status: {
    type: Number,
    default: 0 // 0: pending, 1: rejected, 2: approved
  }
}, {
  timestamps: true
});

const Church = mongoose.model('Church', churchSchema);
module.exports = Church;


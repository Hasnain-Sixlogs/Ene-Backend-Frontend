const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  event_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  event_type: {
    type: String,
    default: null
  },
  start_date: {
    type: Date,
    default: null
  },
  start_time: {
    type: String,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  end_time: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'pending' // pending, approved, rejected
  },
  virtual_link_or_location: {
    type: String,
    default: null
  },
  // user_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;


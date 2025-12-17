const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  video_path: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 1 // 1: active, 0: inactive
  }
}, {
  timestamps: true
});

const Podcast = mongoose.model('Podcast', podcastSchema);
module.exports = Podcast;


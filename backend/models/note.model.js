const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bible_id: {
    type: String,
    required: true
  },
  bible_name: {
    type: String,
    default: null
  },
  book_version: {
    type: String,
    default: null
  },
  filesetsid: {
    type: String,
    default: null
  },
  bookname: {
    type: String,
    default: null
  },
  bookid: {
    type: String,
    default: null
  },
  chapter_number: {
    type: Number,
    required: true
  },
  // Verse information for highlighting
  start_verse: {
    type: Number,
    default: null
  },
  end_verse: {
    type: Number,
    default: null
  },
  highlighted_text: {
    type: String,
    required: true
  },
  // Navigation path to go back to the highlighted location
  api_path: {
    type: String,
    default: null
  },
  // Optional fields
  message: {
    type: String,
    default: null
  },
  thought: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Notes = mongoose.model('Notes', notesSchema);
module.exports = Notes;


const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Create a new note (save highlighted text from Bible)
router.post('/', authenticate, noteController.createNote);

// Get all notes belonging to the authenticated user
router.get('/', authenticate, noteController.getAllNotes);

// Get a specific note by ID (must belong to the user)
router.get('/:id', authenticate, noteController.getNoteById);

// Update a note (must belong to the user)
router.put('/:id', authenticate, noteController.updateNote);

// Delete a note (must belong to the user)
router.delete('/:id', authenticate, noteController.deleteNote);

module.exports = router;


const express = require('express');
const router = express.Router();
const churchController = require('../controllers/church.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Create a new church (requires admin approval)
router.post('/', authenticate, churchController.createChurch);

// Get all churches belonging to the authenticated user
router.get('/', authenticate, churchController.getAllChurches);

// Get a specific church by ID (must belong to the user)
router.get('/:id', authenticate, churchController.getChurchById);

// Delete a church (must belong to the user)
router.delete('/:id', authenticate, churchController.deleteChurch);

// Update church status
router.put('/:id/status', authenticate, churchController.updateChurchStatus);

module.exports = router;


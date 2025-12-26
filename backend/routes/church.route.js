const express = require('express');
const router = express.Router();
const churchController = require('../controllers/church.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadFile } = require('../utils/fileUpload');

// Create a new church (requires admin approval)
router.post('/', authenticate, uploadFile('image'), churchController.createChurch);

// Get all churches belonging to the authenticated user
router.get('/', authenticate, churchController.getAllChurches);

// Get a specific church by ID (must belong to the user)
router.get('/:id', authenticate, churchController.getChurchById);

// Update a church (must belong to the user)
router.put('/:id', authenticate, uploadFile('image'), churchController.updateChurch);

// Delete a church (must belong to the user)
router.delete('/:id', authenticate, churchController.deleteChurch);

// Update church status
router.put('/:id/status', authenticate, churchController.updateChurchStatus);

module.exports = router;


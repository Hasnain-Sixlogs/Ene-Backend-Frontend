const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticateAdmin } = require('../middlewares/admin.middleware');
const { uploadFile } = require('../utils/fileUpload');

// All routes require admin authentication
router.use(authenticateAdmin);

// Get settings
router.get('/', settingsController.getSettings);

// Update profile (with file upload support)
router.put('/profile', uploadFile('profile'), settingsController.updateProfile);

// Update security
router.put('/security', settingsController.updateSecurity);

// Update appearance
router.put('/appearance', settingsController.updateAppearance);

module.exports = router;


const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// User routes (require authentication)
router.get('/', authenticate, videoController.getAllVideos);
router.get('/:id', authenticate, videoController.getVideoById);
router.post('/:id/view', authenticate, videoController.incrementVideoViews);

module.exports = router;


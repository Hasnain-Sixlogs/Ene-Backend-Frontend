const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.route');
const adminRoutes = require('./admin.route');
const prayerRequestRoutes = require('./prayerRequest.route');
const eventRoutes = require('./event.route');
const churchRoutes = require('./church.route');
const noteRoutes = require('./note.route');
const chatRoutes = require('./chat.route');
const videoRoutes = require('./video.route');
const settingsRoutes = require('./settings.route');

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes); // Admin auth routes use same /auth prefix
router.use('/prayer-requests', prayerRequestRoutes);
router.use('/events', eventRoutes);
router.use('/churches', churchRoutes);
router.use('/notes', noteRoutes);
router.use('/chat', chatRoutes);
router.use('/videos', videoRoutes);
router.use('/admin/settings', settingsRoutes);

// Default route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Every Nation Education API',
    version: '1.0.0'
  });
});

module.exports = router;


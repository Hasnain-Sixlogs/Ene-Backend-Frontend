const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middlewares/admin.middleware');

// Admin authentication routes
router.post('/signin', adminController.adminSignin);
router.post('/logout', authenticateAdmin, adminController.adminLogout);
router.post('/refresh', adminController.refresh_token);
router.get('/me', authenticateAdmin, adminController.getAdminMe);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);
router.put('/profile', authenticateAdmin, adminController.updateProfile);

// Dashboard routes (require authentication)
router.get('/dashboard/stats', authenticateAdmin, adminController.getDashboardStats);
router.get('/dashboard/registration-chart', authenticateAdmin, adminController.getRegistrationChart);
router.get('/dashboard/survey-results', authenticateAdmin, adminController.getSurveyResults);
router.get('/dashboard/recent-users', authenticateAdmin, adminController.getRecentUsers);
router.get('/dashboard/total-users', authenticateAdmin, adminController.getTotalUsers);

// Users Management routes
router.get('/users', authenticateAdmin, adminController.getAllUsers);
router.get('/users/:id', authenticateAdmin, adminController.getUserById);
router.put('/users/:id', authenticateAdmin, adminController.updateUser);

// Pastor Requests routes
router.get('/pastor-requests', authenticateAdmin, adminController.getAllPastorRequests);
router.get('/pastor-requests/:id', authenticateAdmin, adminController.getPastorRequestById);
router.put('/pastor-requests/:id/status', authenticateAdmin, adminController.updatePastorRequestStatus);
router.delete('/pastor-requests/:id', authenticateAdmin, adminController.deletePastorRequest);

// Follow-Up Requests routes
router.get('/follow-up-requests/stats', authenticateAdmin, adminController.getFollowUpStats);
router.get('/follow-up-requests', authenticateAdmin, adminController.getAllFollowUpRequests);
router.post('/follow-up-requests', authenticateAdmin, adminController.createFollowUpRequest);
router.get('/follow-up-requests/:id', authenticateAdmin, adminController.getFollowUpRequestById);
router.put('/follow-up-requests/:id', authenticateAdmin, adminController.updateFollowUpRequest);
router.put('/follow-up-requests/:id/status', authenticateAdmin, adminController.updateFollowUpRequestStatus);
router.delete('/follow-up-requests/:id', authenticateAdmin, adminController.deleteFollowUpRequest);

// Church Management routes
router.get('/churches/stats', authenticateAdmin, adminController.getChurchStats);
router.get('/churches', authenticateAdmin, adminController.getAllChurchesAdmin);
router.get('/churches/:id', authenticateAdmin, adminController.getChurchByIdAdmin);
router.put('/churches/:id', authenticateAdmin, adminController.updateChurchAdmin);
router.delete('/churches/:id', authenticateAdmin, adminController.deleteChurchAdmin);

// Prayer Requests Management routes
router.get('/prayer-requests/stats', authenticateAdmin, adminController.getPrayerRequestStats);
router.get('/prayer-requests', authenticateAdmin, adminController.getAllPrayerRequestsAdmin);
router.get('/prayer-requests/:id', authenticateAdmin, adminController.getPrayerRequestByIdAdmin);
router.put('/prayer-requests/:id', authenticateAdmin, adminController.updatePrayerRequestAdmin);
router.put('/prayer-requests/:id/status', authenticateAdmin, adminController.updatePrayerRequestStatusAdmin);
router.delete('/prayer-requests/:id', authenticateAdmin, adminController.deletePrayerRequestAdmin);

// Video Management routes
const videoController = require('../controllers/video.controller');
router.get('/videos/stats', authenticateAdmin, videoController.getVideoStats);
router.get('/videos', authenticateAdmin, videoController.getAllVideosAdmin);
router.post('/videos', authenticateAdmin, videoController.createVideo);
router.get('/videos/:id', authenticateAdmin, videoController.getVideoByIdAdmin);
router.put('/videos/:id', authenticateAdmin, videoController.updateVideo);
router.put('/videos/:id/status', authenticateAdmin, videoController.updateVideoStatus);
router.delete('/videos/:id', authenticateAdmin, videoController.deleteVideo);

module.exports = router;


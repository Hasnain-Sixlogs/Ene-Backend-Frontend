const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadFile } = require('../utils/fileUpload');

router.post('/signup', authController.signup);

router.post('/signin', authController.signin);

router.post('/verify-otp', authController.verifyOTP);

router.post('/resend-otp', authController.resendOTP);

router.post('/social-login', authController.socialLogin);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password', authController.resetPassword);

router.put('/set-language', authenticate, authController.setLanguage);

router.put('/accept-lord', authenticate, authController.acceptLord);

router.put('/update-profile', authenticate, uploadFile('profile'), authController.updateProfile);

router.get('/get-admin', authenticate, authController.getAdmin);

module.exports = router;


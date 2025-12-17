const express = require('express');
const router = express.Router();
const prayerRequestController = require('../controllers/prayerRequest.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, prayerRequestController.createPrayerRequest);

router.get('/', authenticate, prayerRequestController.getAllPrayerRequests);

router.get('/:id', authenticate, prayerRequestController.getPrayerRequestById);

router.put('/:id', authenticate, prayerRequestController.updatePrayerRequest);

router.put('/:id/status', authenticate, prayerRequestController.updatePrayerRequestStatus);

router.delete('/:id', authenticate, prayerRequestController.deletePrayerRequest);

module.exports = router;


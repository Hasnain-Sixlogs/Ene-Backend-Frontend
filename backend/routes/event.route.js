const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/', authenticate, eventController.createEvent);

router.get('/', authenticate, eventController.getAllEvents);

router.get('/user/my-events', authenticate, eventController.getMyEvents);

router.get('/:id', authenticate, eventController.getEventById);

router.put('/:id', authenticate, eventController.updateEvent);

router.put('/:id/status', authenticate, eventController.updateEventStatus);

router.delete('/:id', authenticate, eventController.deleteEvent);

module.exports = router;


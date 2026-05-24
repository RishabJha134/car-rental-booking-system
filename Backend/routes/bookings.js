const express = require('express');

const bookingController = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, requireRole('customer'), bookingController.createBooking);
router.get('/', requireAuth, bookingController.getBookings);

module.exports = router;
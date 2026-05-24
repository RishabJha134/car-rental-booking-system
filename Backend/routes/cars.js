const express = require('express');

const carController = require('../controllers/carController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', carController.getAvailableCars);
router.get('/my-cars', requireAuth, requireRole('agency'), carController.getMyCars);
router.get('/:id', carController.getCarById);
router.post('/', requireAuth, requireRole('agency'), carController.addCar);
router.put('/:id', requireAuth, requireRole('agency'), carController.updateCar);

module.exports = router;
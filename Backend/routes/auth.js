const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register-customer', authController.registerCustomer);
router.post('/register-agency', authController.registerAgency);
router.post('/login', authController.login);

module.exports = router;
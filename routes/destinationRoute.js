const express = require('express');
const router = express.Router();
const {createDestination} = require('../controllers/destination/destinationController');

// Endpoint untuk navigasi ke destinasi
router.post('/destination', createDestination);

module.exports = router;

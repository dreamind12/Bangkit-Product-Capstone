// routes.js atau index.js
const express = require('express');
const router = express.Router();
const {navigateToDestination} = require('../controllers/navigate/navigationController');

// Endpoint untuk navigasi ke destinasi
router.post('/navigate/:destinationId', navigateToDestination);

module.exports = router;

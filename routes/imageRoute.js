const express = require('express');
const { predict, upload, predictAndSearch} = require('../controllers/imageController');
const router = express.Router();

router.post('/reference', predict);

module.exports = router;
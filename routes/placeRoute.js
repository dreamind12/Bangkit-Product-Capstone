const express = require('express');
const { getPlaceInfo } = require('../controllers/placesController');
const router = express.Router();

router.get('/getPlaceInfo', getPlaceInfo);

module.exports = router;
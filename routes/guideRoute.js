const express = require('express');
const { authMiddleware, isPartner } = require('../middlewares/authMiddleware');
const { addGuide, getGuide, getAllGuide, updateGuide, deleteGuide, likeGuide, wishlistGuide, getTopGuide, getRatingGuide, } = require('../controllers/product/guideController');
const { addBookingGuide, paymentGuide } = require('../controllers/payment/bookGuideController');
const router = express.Router();

router.post('/create', authMiddleware, addGuide);
router.post('/like/:id', authMiddleware, likeGuide);
router.post('/wishlist/:id', authMiddleware, wishlistGuide);
router.post('/booking/:guideId', authMiddleware, addBookingGuide);
router.post('/booking/pay/:id', authMiddleware, paymentGuide);
router.get('/get/:id', getGuide);
router.get('/getAll', getAllGuide);
router.get('/getRank', getTopGuide);
router.get('/rating/:guideId', getRatingGuide);
router.put('/update/:id', authMiddleware, updateGuide);
router.delete('/delete/:id', authMiddleware, deleteGuide);

module.exports = router;
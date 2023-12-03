const express = require('express');
const { addRoom, getRoom, getAllRoom, updateRoom, deleteRoom, likeRoom, wishlistRoom, getRatingRoom, getRankRoom, } = require('../controllers/product/roomController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const { addBooking, paymentRoom, getDetailInvoice } = require('../controllers/payment/bookingController');
const router = express.Router();

router.post('/create', authMiddleware, addRoom);
router.post('/like/:roomId', authMiddleware, likeRoom);
router.post('/wishlist/:roomId', authMiddleware, wishlistRoom);
router.post('/booking/:roomId', authMiddleware, addBooking);
router.post('/booking/pay/:bookingId', authMiddleware, paymentRoom);
router.get('/get/:id', getRoom);
router.get('/getAll', getAllRoom);
router.get('/getRank', getRankRoom);
router.get('/rating/:roomId', getRatingRoom);
router.put('/update/:id', authMiddleware, updateRoom);
router.delete('/delete/:id', authMiddleware, deleteRoom);


module.exports = router;
const express = require('express');
const { addRoom, getRoom, getAllRoom, updateRoom, deleteRoom, likeRoom, wishlistRoom, } = require('../controllers/product/roomController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const { addBooking, paymentRoom, getDetailInvoice } = require('../controllers/payment/bookingController');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addRoom);
router.post('/like/:roomId', authMiddleware, likeRoom);
router.post('/wishlist/:roomId', authMiddleware, wishlistRoom);
router.post('/booking/:roomId', authMiddleware, addBooking);
router.post('/booking/pay/:bookingId', authMiddleware, paymentRoom);
router.get('/get/:id', getRoom);
router.get('/getAll', getAllRoom);
router.put('/update/:id', authMiddleware, isPartner, updateRoom);
router.delete('/delete/:id', authMiddleware, isPartner, deleteRoom);


module.exports = router;
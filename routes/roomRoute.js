const express = require('express');
const { addRoom, getRoom, getAllRoom, updateRoom, deleteRoom, likeRoom, wishlistRoom, getAllWishlists } = require('../controllers/roomController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addRoom);
router.post('/like/:roomId', authMiddleware, likeRoom);
router.post('/wishlist/:roomId', authMiddleware, wishlistRoom);
router.get('/get/:id', getRoom);
router.get('/getAll', getAllRoom);
router.get('/getAllWishlist', authMiddleware, getAllWishlists);
router.put('/update/:id', authMiddleware, isPartner, updateRoom);
router.delete('/delete/:id', authMiddleware, isPartner, deleteRoom);


module.exports = router;
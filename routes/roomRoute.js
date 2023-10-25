const express = require('express');
const { addRoom, getRoom, getAllRoom, updateRoom, deleteRoom, likeRoom, wishlistRoom } = require('../controllers/roomController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addRoom);
router.post('/like/:roomId', authMiddleware, likeRoom);
router.post('/wishlist/:id', authMiddleware, wishlistRoom);
router.get('/get/:id', getRoom);
router.get('/getAll', getAllRoom);
router.put('/update/:id', authMiddleware, isPartner, updateRoom);
router.delete('/delete/:id', authMiddleware, isPartner, deleteRoom);
router.delete('/unlike/:id', authMiddleware, likeRoom);
router.delete('/unwishlist/:id', authMiddleware, wishlistRoom);

module.exports = router;
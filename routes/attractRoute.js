const express = require('express');
const { authMiddleware, isPartner } = require('../middlewares/authMiddleware');
const { addAttraction, getAttraction, getAllAttraction, updateAttraction, deleteAttraction, getAllWishlists, likeAttract, wishlistAttraction } = require('../controllers/product/attractController');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addAttraction);
router.post('/like/:id', authMiddleware, likeAttract);
router.post('/wishlist/:id', authMiddleware, wishlistAttraction);
router.get('/get/:id', authMiddleware, getAttraction);
router.get('/getAll', getAllAttraction);
router.get('/getAllWishlist', authMiddleware, getAllWishlists);
router.put('/update/:id', authMiddleware, isPartner, updateAttraction);
router.delete('/delete/:id', authMiddleware, isPartner, deleteAttraction);

module.exports = router;
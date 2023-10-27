const express = require('express');
const { authMiddleware, isPartner } = require('../middlewares/authMiddleware');
const { addGuide, getGuide, getAllGuide, updateGuide, deleteGuide, likeGuide, wishlistGuide, getAllWishlists } = require('../controllers/product/guideController');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addGuide);
router.post('/like/:id', authMiddleware, likeGuide);
router.post('/wishlist/:id', authMiddleware, wishlistGuide);
router.get('/get/:id', getGuide);
router.get('/getAll', getAllGuide);
router.get('/getAllWishlist', authMiddleware, getAllWishlists);
router.put('/update/:id', authMiddleware, isPartner, updateGuide);
router.delete('/delete/:id', authMiddleware, isPartner, deleteGuide);

module.exports = router;
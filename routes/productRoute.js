const express = require('express');
const { addProduct, getProduct, getAllProduct, updateProduct, deleteProduct, likeProduct } = require('../controllers/productController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addProduct);
router.post('/like-product/:id', authMiddleware, likeProduct);
router.post('/wishlist-product/:id', authMiddleware, likeProduct);
router.get('/get/:id', getProduct);
router.get('/getAll', getAllProduct);
router.put('/update/:id', authMiddleware, isPartner, updateProduct);
router.delete('/delete/:id', authMiddleware, isPartner, deleteProduct);
router.delete('/unlike-product/:id', authMiddleware, likeProduct);
router.post('/unwishlist-product/:id', authMiddleware, likeProduct);

module.exports = router;
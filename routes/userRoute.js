const express = require('express');
const { createUser, loginUser, getUser, getAllUser, updateUser, choosePreference, addRating, getDetailInvoice, getAllInvoice, searchAll, getAllWishlists } = require('../controllers/userController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');
const { createPost, createStep, getPost, getStep, getPostWithSteps, likePost, wishlistPost, updatePost } = require('../controllers/posts/postController');
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/post', authMiddleware, createPost);
router.post('/update-post', authMiddleware, updatePost);
router.post('/post/step/:postId', authMiddleware, createStep);
router.post('/addRating', authMiddleware, addRating);
router.post('/like/:postId', authMiddleware, likePost);
router.post('/wishlist/:postId', authMiddleware, wishlistPost);
router.get('/get/:id', getUser);
router.get('/getAll', getAllUser);
router.get('/detailInvoice/:invoiceId', authMiddleware, getDetailInvoice);
router.get('/getAllInvoice', authMiddleware, getAllInvoice);
router.get('/getAllWishlist', authMiddleware, getAllWishlists);
router.get('/getPost/:postId', getPost);
router.get('/search', authMiddleware, searchAll);
router.put('/update/:id', authMiddleware, updateUser);
router.post('/choose-preference', authMiddleware, choosePreference);

module.exports = router;
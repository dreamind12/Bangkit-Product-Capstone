const express = require('express');
const { createUser, loginUser, logoutUser, getUser, getAllUser, updateUser, choosePreference, addRating, getDetailInvoice, getAllInvoice, searchAll, getAllWishlists, search } = require('../controllers/userController');
const { authMiddleware, isUser } = require('../middlewares/authMiddleware');
const { createPost, createStep, getPost, getStep, getPostWithSteps, likePost, wishlistPost, updatePost ,deletePostById, updateStep } = require('../controllers/posts/postController');
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.post('/post', authMiddleware, createPost);
router.post('/post/step/:postId', authMiddleware, createStep);
router.post('/addRating', authMiddleware, addRating);
router.post('/like/:postId', authMiddleware, likePost);
router.post('/wishlist/:postId', authMiddleware, wishlistPost);
router.post('/logout', authMiddleware, logoutUser);
router.get('/get/:id', getUser);
router.get('/getAll', getAllUser);
router.get('/detailInvoice/:invoiceId', authMiddleware, getDetailInvoice);
router.get('/getAllInvoice', authMiddleware, getAllInvoice);
router.get('/getAllWishlist', authMiddleware, getAllWishlists);
router.get('/getPost/:postId', getPost);
router.get('/searchAll', authMiddleware, searchAll);
router.get('/search', authMiddleware, search);
router.put('/update/:id', authMiddleware, updateUser);
router.put('/update-post/:postId', authMiddleware, updatePost);
router.put('/post/update-step/:id', authMiddleware, updateStep);
router.post('/choose-preference', authMiddleware, choosePreference);
router.delete('/delete-post/:postId', authMiddleware, deletePostById);

module.exports = router;
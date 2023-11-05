const express = require('express');
const { createUser, loginUser, getUser, getAllUser, updateUser,choosePreference } = require('../controllers/userController');
const {authMiddleware, isUser} = require('../middlewares/authMiddleware');



const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/get/:id', getUser);
router.get('/getAll', getAllUser);
router.put('/update/:id',authMiddleware,isUser, updateUser);
router.post('/choose-preference', authMiddleware, choosePreference);

module.exports = router;
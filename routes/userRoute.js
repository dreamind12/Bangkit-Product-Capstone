const express = require('express');
const { createUser, loginUser, getUser, getAllUser, updateUser } = require('../controllers/userController');


const router = express.Router();

router.post('/register-user', createUser);
router.post('/login-user', loginUser);
router.get('/get-user/:id', getUser);
router.get('/getAll', getAllUser);
router.put('/update/:id', updateUser);

module.exports = router;
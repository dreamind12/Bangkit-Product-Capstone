const express = require('express');
const { createUser, loginUser, getUser, getAllUser, updateUser } = require('../controllers/userController');


const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/get/:id', getUser);
router.get('/getAll', getAllUser);
router.put('/update/:id', updateUser);

module.exports = router;
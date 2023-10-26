const express = require('express');
const { authMiddleware, isPartner } = require('../middlewares/authMiddleware');
const { addAttraction, getAttraction, getAllAttraction, updateAttraction, deleteAttraction } = require('../controllers/attractController');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addAttraction);
router.get('/get/:id', authMiddleware, getAttraction);
router.get('/getAll', getAllAttraction);
router.put('/update/:id', authMiddleware, isPartner, updateAttraction);
router.delete('/delete/:id', authMiddleware, isPartner, deleteAttraction);

module.exports = router;
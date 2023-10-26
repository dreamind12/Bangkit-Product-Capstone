const express = require('express');
const { authMiddleware, isPartner } = require('../middlewares/authMiddleware');
const { addGuide, getGuide, getAllGuide, updateGuide, deleteGuide } = require('../controllers/guideController');
const router = express.Router();

router.post('/create', authMiddleware, isPartner, addGuide);
router.get('/get/:id', getGuide);
router.get('/getAll', getAllGuide);
router.put('/update/:id', authMiddleware, isPartner, updateGuide);
router.delete('/delete/:id', authMiddleware, isPartner, deleteGuide);

module.exports = router;
const express = require('express');
const { createPartner, loginPartner, getPartner, getAllPartner, updatePartner, chooseCategory } = require('../controllers/partnerController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createPartner);
router.post('/login', loginPartner);
router.post('/choose-category', authMiddleware, chooseCategory);
router.get('/get/:id', getPartner);
router.get('/getAll', getAllPartner);
router.put('/update/:id', authMiddleware, isPartner, updatePartner);

module.exports = router;
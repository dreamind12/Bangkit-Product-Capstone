const express = require('express');
const { createPartner, loginPartner, getPartner, getAllPartner, updatePartner, chooseCategory, searchAll, getDetailInvoice, getAllInvoice, addRating } = require('../controllers/partnerController');
const {authMiddleware, isPartner} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createPartner);
router.post('/login', loginPartner);
router.post('/choose-category', authMiddleware, chooseCategory);
router.post('/addRating', authMiddleware, addRating);
router.get('/get/:id', getPartner);
router.get('/getAll', getAllPartner);
router.get('/detailInvoice/:invoiceId', authMiddleware, getDetailInvoice);
router.get('/getAllInvoice', authMiddleware, getAllInvoice);
router.get('/search', searchAll);
router.put('/update/:id', authMiddleware, isPartner, updatePartner);

module.exports = router;
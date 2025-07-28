const express = require('express');
const router = express.Router();
const giftController = require('../controllers/GiftController');


// Create a new gift record
router.post('/create', giftController.createGift);

// Complete a gift transaction
router.post('/complete',  giftController.completeGift);



module.exports = router;
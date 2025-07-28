const express = require('express');
const { createUser, getUser, getUserByWallet } = require('../controllers/userController');

const router = express.Router();

router.post('/create-user', createUser);     
router.get('/:uid', getUser);  
router.get('/', getUserByWallet);



module.exports = router;

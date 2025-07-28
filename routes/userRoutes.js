const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create user
router.post('/users', userController.createUser);

// Get all users
router.get('/users', userController.getAllUsers);

// Get user by UID
router.get('/users/:uid', userController.getUserById);

// Get user by wallet address
router.get('/users/by-wallet', userController.getUserByWallet);

module.exports = router;

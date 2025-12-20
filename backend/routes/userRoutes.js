const express = require('express');
const authController = require('../controllers/authController')

const router = express.Router();

// @Route POST /api/users/register
// @desc Register a new user
// @acess PUblic
router.post('/register', authController.signup);
router.post('/login', authController.login);


module.exports = router;
const express = require('express');
const authController = require('../controllers/authController')
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @Route POST /api/users/register
// @desc Register a new user
// @acess Public
router.post('/register', authController.signup);

// @Route POST /api/users/login
// @desc login using a user credential
// @acess Public
router.post('/login', authController.login);


// @Route GET /api/users/profile
// @desc get logged in user's profile (Protected Route)
// @acess Private
router.get('/profile', protect, async(req, res) => {
    res.status(200).json({user: req.user});
})

module.exports = router;
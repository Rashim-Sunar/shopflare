const express = require('express');
const cartController = require('../controllers/cartController')
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @route POST /api/cart
// @desc Add a product to the cart for a guest or loggged in user
// @access Public
router.post('/', cartController.addToCart);

module.exports = router;


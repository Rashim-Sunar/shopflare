const express = require('express');
const cartController = require('../controllers/cartController')
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @route POST /api/cart
// @desc Add a product to the cart for a guest or loggged in user
// @access Public
router.post('/', cartController.addToCart);

// @route DELETE /api/cart
// @desc Remove a product from cart (guest or logged-in user)
// @access Public
router.delete('/', cartController.deleteFromCart);

// @route GET /api/cart
// @desc Retrieve cart for the logged-in user or gues
// @access Public
router.get('/', cartController.getCart);

// @route POST /api/cart/merge
// @desc Merge guest cart into logged-in user cart on login
// @access Private (after login)
router.post('/merge', protect, cartController.mergeGuestCart);


module.exports = router;


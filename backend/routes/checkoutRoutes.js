const express = require('express');
const checkoutController = require('../controllers/checkoutController')
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
router.post("/", protect, checkoutController.createCheckout);

// @route PUT /api/checkout/:id/pay
// @desc Update the checkout to paid after successful payment
// @ access PRIVATE
router.put('/:id/pay', protect, checkoutController.payCheckout);

// @route POST /api/checkout/:id/finalize
// @desc Finalize the checkout if already paid && convert the checkout into order after finalizing it
// @access PRIVATE
router.post('/:id/finalize', protect, checkoutController.finalizeCheckout);

module.exports = router;

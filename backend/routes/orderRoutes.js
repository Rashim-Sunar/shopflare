const express = require('express');
const orderController = require('../controllers/orderController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @route GET /api/orders/my-orders
// @desc vGet all the orders of logged-in user
// @access PRIVATE
router.get('/my-orders', protect, orderController.getMyOrders);

// @route GET /api/order/:id
// @desc Retreive order details by orderId
// @access PRIVATE
router.get('/:id', orderController.getOrderById);

module.exports = router;
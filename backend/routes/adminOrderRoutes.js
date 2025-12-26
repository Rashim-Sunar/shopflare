const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const Order = require('../models/Order');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

const router = express.Router();

// @route GET /api/routes/orders
// @desc Get all the order(Admin only)
// @access PIVATE/ADMIN
router.get('/', protect, restrictTo('admin'), asyncErrorHandler(async(req, res, next) => {
    const orders = await Order.find().populate("user", "name email");
    res.status(200).json({
        message: "success",
        totalOrders: orders.length,
        orders
    });
}));

// @route PUT /api/routes/orders/:id
// @desc Update order status (Admin only)
// @access PIVATE/ADMIN
router.put('/:id', protect, restrictTo('admin'), asyncErrorHandler( async(req, res, next) => {
    const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
    return next(
        new customError(
        `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
        400
        )
    );
    }

    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new customError("Order not found!", 404));
    }

    order.status = req.body.status || order.status;
    order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
    order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

    const updatedOrder = await order.save();

    res.status(200).json({
        status: "success", 
        updatedOrder,
    });
}));

// @route DELETE /api/routes/orders/:id
// @desc Delete order (Admin only)
// @access PIVATE/ADMIN
router.delete('/:id', protect, restrictTo("admin"), asyncErrorHandler( async(req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new customError("Order not found", 404));
    }

    await order.deleteOne();
    res.status(200).json({
        status: "success",
        message: "Order deleted successfully!"
    });
}))

module.exports = router;


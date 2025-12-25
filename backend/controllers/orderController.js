const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');
const Order = require("../models/Order");


// Retrieve all orders of logged-in user
exports.getMyOrders = asyncErrorHandler( async(req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 });

    if(!orders){
        return next(new customError("Order not found!", 404));
    }

    res.status(200).json({
        status: "success",
        order: orders
    });
});

// Retrieve order by orderId
exports.getOrderById = asyncErrorHandler( async(req, res, next) => {
    const orderId  = req.params.id;
    console.log(orderId)

    const order = await Order.findById(orderId)
        .populate("user", "name email");

    if(!order){
        return next(new customError("Order not found!", 404));
    }

    res.status(200).json({
        status: "success",
        order
    });
});
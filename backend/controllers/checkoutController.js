const Order = require("../models/Order");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

/* ---------------- CREATE CHECKOUT ---------------- */
exports.createCheckout = asyncErrorHandler( async(req, res, next) => {
    const { 
        checkoutItems, 
        shippingAddress, 
        paymentMethod, 
        totalPrice 
    } = req.body;

    if( !checkoutItems || checkoutItems.length === 0 ){
        return next( new customError("No items in the checkout", 400));
    }

    const newCheckout = await Checkout.create({
        user: req.user._id,
        checkoutItems,
        shippingAddress,
        paymentMethod, 
        totalPrice,
    });

    // console.log(`Checkout created successfully for user: ${req.user._id}`);
    res.status(200).json({
        status: "success",
        message: "Checkout created successfully",
        checkout: newCheckout
    });
});

/* ---------------- PAY CHECKOUT ---------------- */
exports.payCheckout = asyncErrorHandler( async(req, res, next) => {
    const { paymentStatus, paymentDetails } = req.body;

    if(paymentStatus !== 'paid'){
        return next( new customError("Invalid payment status", 400) );
    }

    const checkout = await Checkout.findById(req.params.id);

    if(!checkout){
        return next(new customError("Checkout not found!", 404));
    }

    checkout.isPaid = true;
    checkout.paymentStatus = paymentStatus;
    checkout.paymentDetails = paymentDetails;
    checkout.paidAt = Date.now(); 
    
    await checkout.save();
    res.status(200).json({
        status: "success",
        checkout
    })
});

/* ---------------- FINALIZE CHECKOUT ---------------- */
exports.finalizeCheckout = asyncErrorHandler( async(req, res, next) => {
    const checkout = await Checkout.findById(req.params.id);

    if(!checkout){
        return next(new customError("Checkout not found!", 404));
    }

    if(!checkout.isPaid){
        return next(new customError("Checkout not yet paid!", 400));
    }

    if(checkout.isFinalized){
        return next(new customError("Checkout already finalized.", 400));
    }

    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    const order = await Order.create({
        user: checkout.user,
        orderedItems: checkout.checkoutItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        totalPrice: checkout.totalPrice,
        isPaid: checkout.isPaid,
        paidAt: checkout.paidAt,
        paymentStatus: checkout.paymentStatus,
    });

    // Clear user cart after order creation
    await Cart.findByIdAndDelete(checkout.user);

    res.status(200).json({
        status: "success",
        message: "Order finalized successfully",
        order
    });
});
const Cart = require('../models/Cart');
const Product = require("../models/Product");
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');


/* ================= ADD TO CART ================= */

exports.addToCart = asyncErrorHandler(async (req, res, next) => {
    let {
        productId,
        quantity = 1,
        size,
        color,
        guestId,
        userId,
    } = req.body;

    /* ---------- VALIDATE PRODUCT ---------- */

    const product = await Product.findById(productId);

    if (!product) {
        return next(new customError("Product not found", 404));
    }

    if (!product.isPublished) {
        return next(new customError("Product is not available", 400));
    }

    /* ---------- HANDLE GUEST ID CREATION ---------- */

    if (!guestId && !userId) {
        guestId = `guest_${Date.now()}`;
    }

    /* ---------- FIND CART ---------- */

    let cart;

    if (userId) {
        cart = await Cart.findOne({ user: userId });
    } else {
        cart = await Cart.findOne({ guestId });
    }

    /* ---------- CREATE CART IF NOT EXISTS ---------- */

    if (!cart) {
        cart = new Cart({
            user: userId || undefined,
            guestId: userId ? undefined : guestId,
            products: [],
            totalPrice: 0,
        });
    }

    /* ---------- CHECK EXISTING PRODUCT ---------- */

    const existingItem = cart.products.find(
        (item) =>
            item.productId.toString() === productId &&
            item.size === size &&
            item.color === color
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.products.push({
            productId: product._id,
            name: product.name,
            image: product.images?.[0]?.url || "",
            price: product.discountPrice || product.price,
            size,
            color,
            quantity,
        });
    }

    /* ---------- RECALCULATE TOTAL ---------- */

    cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    await cart.save();

    res.status(200).json({
        status: "success",
        guestId: cart.guestId || null,
        cart,
    });
});

/* ================= DELETE FROM CART ================= */

exports.deleteFromCart = asyncErrorHandler( async(req, res, next) => {
    const {
        productId,
        color,
        size,
        userId,
        guestId
    } = req.body;

     /* ---------- VALIDATION ---------- */
     if( !productId ){
        return next( new customError("Product ID is required", 400));
     }

      /* ---------- FIND CART ---------- */
      let cart;

      if(userId){
        cart = await Cart.findOne({ user: userId });
      }else if(guestId){
        cart = await Cart.findOne({ guestId });
      }else{
        return next(new customError("Guest ID or User ID is required", 400));
      }

      if(!cart){
        return next(new customError("Cart not found!", 404));
      }

    /* ---------- REMOVE PRODUCT ---------- */
      const initialLength = cart.products.length;

      cart.products = cart.products.filter(
        (item) => 
            !(
                item.productId.toString() === productId &&
                item.size === size &&
                item.color === color
            )
      );

      if(cart.products.length === initialLength){
        return next(new customError("Product not found in cart!", 404));
      }

      /* ---------- RECALCULATE TOTAL ---------- */
      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await cart.save();

      res.status(200).json({
        status: "success",
        cart
      });
});

/* ================= GET CART ================= */

exports.getCart = asyncErrorHandler( async(req, res, next) => {
    const { userId, guestId } = req.query;

    let cart;

    // FIND CART
    if(userId){
        cart = await Cart.findOne({ user: userId });
    }else if(guestId){
        cart = await Cart.findOne({ guestId });
    }else{
        return next(new customError("Guest ID or User ID is required", 400));
    }

    /* ---------- NO CART FOUND ---------- */

    if (!cart) {
        return res.status(200).json({
            status: "success",
            cart: {
                products: [],
                totalPrice: 0,
            },
        });
    }

    res.status(200).json({
        status: "success",
        cart,
    });

});
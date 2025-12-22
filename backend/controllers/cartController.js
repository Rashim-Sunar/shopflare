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

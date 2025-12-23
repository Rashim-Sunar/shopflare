const Cart = require('../models/Cart');
const Product = require("../models/Product");
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

// Helper to create a unique key per cart item variant ( used while merging guest cart to user cart)
const makeKey = (item) =>
    `${item.productId.toString()}-${item.size || ""}-${item.color || ""}`;

/* =============================================== */
/* ================= ADD TO CART ================= */
/* =============================================== */

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

/* ================================================================== */
/* ======================== DELETE FROM CART ======================== */
/* =================================================================== */

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

/* ============================================================ */
/* ========================= GET CART ========================= */
/* ============================================================= */

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

/* =================================================================== */
/* ================= MERGE GUEST CART INTO USER CART ================= */
/* =================================================================== */

exports.mergeGuestCart = asyncErrorHandler( async(req, res, next) => {
    const { guestId } = req.body;
    const userId = req.user._id;

    if(!guestId || !userId){
        return next(new customError("Both Guest ID and UserID are required!", 400));
    }

    /* ---------- FETCH CARTS ---------- */
    const guestCart = await Cart.findOne({ guestId });
    let userCart = await Cart.findOne({ user: userId });

    // If no guest cart, nothing to merge
    if(!guestCart){
         return res.status(200).json({
            status: "success",
            message: "No guest cart to merge",
            cart: userCart || {
                products: [],
                totalPrice: 0,
            },
        });
    }

    // If guest cart has no products, nothing to merge and delete the guest cart permanently
    if(guestCart.products.length === 0){
        await guestCart.deleteOne();
        return res.status(200).json({
            status: "success",
            message: "No products in guest cart to merge, so guest cart deleted permanently",
            cart: userCart || {
                products: [],
                totalPrice: 0
            }
        });
    }

    // If user cart doesn't exist, convert guest cart into user cart
    if(!userCart){
        guestCart.user = userId;
        guestCart.guestId = undefined;
        await guestCart.save();
        return res.status(200).json({
            status: "success",
            message: "Guest cart merged successfully",
            cart: guestCart
        });
    }

    // If both user cart and guest cart exists then merge the products of guest cart in user cart and finally delete the guest cart

    // Create a map of existing user cart items for O(1) lookup
    const userItemMap = new Map(
        userCart.products.map(item => [makeKey(item), item])
    );

    // Start total with existing user cart total
    let totalPrice = userCart.totalPrice || 0;

    // Merge guest cart items into user cart
    guestCart.products.forEach((guestItem) => {guest_1766509147354
        const key = makeKey(guestItem);
        const existingItem = userItemMap.get(key);

        const itemPrice = Number(guestItem.price) || 0;

        if (existingItem) {
            // If item exists, increase quantity
            existingItem.quantity += guestItem.quantity;

            // Add only the incremental cost
            totalPrice += itemPrice * guestItem.quantity;
        } else {
            // If item does not exist, add it to cart
            userCart.products.push(guestItem);

            // Add full cost of the new item
            totalPrice += itemPrice * guestItem.quantity;

            // Track newly added item in the map
            userItemMap.set(key, guestItem);
        }
    });

    // Assign the computed total price back to the cart
    userCart.totalPrice = totalPrice;

    await userCart.save();
    await guestCart.deleteOne();

    res.status(200).json({
        status: "success",
        message: "Guest cart merged successfully",
        cart: userCart
    })
});
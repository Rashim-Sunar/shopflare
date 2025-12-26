const express = require('express');
const protect = require('../middlewares/authMiddleware');
const restrictTo = require('../middlewares/roleMiddleware');
const Product = require('../models/Product');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const router = express();

// @route GET /api/admin/products
// @desc Get all the products(Admin only)
// @access Private/Admin
router.get('/', protect, restrictTo("admin"), asyncErrorHandler((async(req, res, next) => {
    const products = await Product.find();
    res.status(200).json({
        status: "success",
        totalProducts: products.length,
        products,
    });
})));

module.exports = router;
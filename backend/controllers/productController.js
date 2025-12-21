const Product = require('../models/Product');

const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

exports.createProduct = asyncErrorHandler(async(req, res, next) => {
    const {
        name,
        description,
        price,
        discountPrice,
        countInStock,
        sku,
        category,
        brand,
        sizes,
        colors,
        collections,
        material,
        gender, 
        images,
        isFeatured,
        isPublished,
        tags,
        dimensions,
        weight,
    } = req.body;

    const product = new Product({
        name,
        description,
        price,
        discountPrice,
        countInStock,
        sku,
        category,
        brand,
        sizes,
        colors,
        collections,
        material,
        gender, 
        images,
        isFeatured,
        isPublished,
        tags,
        dimensions,
        weight,
        user: req.user._id
    });

    const createdProduct = await product.save();
    res.status(201).json({
        status: "success",
        createdProduct
    });
})
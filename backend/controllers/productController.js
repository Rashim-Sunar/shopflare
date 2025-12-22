const Product = require('../models/Product');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const customError = require('../utils/customError');

/* ================= CREATE PRODUCT ================= */

exports.createProduct = asyncErrorHandler(async (req, res, next) => {
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
        user: req.user._id,
    });

    const createdProduct = await product.save();

    res.status(201).json({
        status: "success",
        createdProduct,
    });
});

/* ================= UPDATE PRODUCT ================= */

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
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

    // Find product by ID
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new customError("Product not found", 404));
    }

    // Update fields (only if provided)
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.discountPrice = discountPrice ?? product.discountPrice;
    product.countInStock = countInStock ?? product.countInStock;
    product.sku = sku ?? product.sku;
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.sizes = sizes ?? product.sizes;
    product.colors = colors ?? product.colors;
    product.collections = collections ?? product.collections;
    product.material = material ?? product.material;
    product.gender = gender ?? product.gender;
    product.images = images ?? product.images;
    product.isFeatured = isFeatured ?? product.isFeatured;
    product.isPublished = isPublished ?? product.isPublished;
    product.tags = tags ?? product.tags;
    product.dimensions = dimensions ?? product.dimensions;
    product.weight = weight ?? product.weight;

    const updatedProduct = await product.save();

    res.status(200).json({
        status: "success",
        updatedProduct,
    });
});

/* ================= DELETE PRODUCT ================= */

exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new customError("Product not found", 404));
    }

    await product.deleteOne();

    res.status(200).json({
        status: "success",
        message: "Product deleted successfully",
    });
});


/* ================= GET ALL PRODUCTS ================= */

exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    const {
        collection,
        category,
        gender,
        color,
        size,
        material,
        brand,
        minPrice,
        maxPrice,
        sort,
        search,
        page = 1,
        limit = 12
    } = req.query;

    const query = {};

    /* ---------- FILTERS ---------- */
    if(collection && collection.toLocaleLowerCase() !==  "all"){
        query.collections = collection;
    }
    if (category) {
        query.category = { $in: category.split(",") };
    }
    if (gender) {
        query.gender = { $in: gender.split(",") };
    }
    if (color) {
        query.colors = { $in: color.split(",") };
    }
    if (size) {
        query.sizes = { $in: size.split(",") };
    }
    if (material) {
        query.material = { $in: material.split(",") };
    }
    if (brand) {
        query.brand = { $in: brand.split(",") };
    }

    /* ---------- PRICE RANGE ---------- */

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    /* ---------- SEARCH (Name + Description) ---------- */

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    /* ---------- SORTING ---------- */

    let sortOption = {};

    if (sort === "low-high") sortOption.price = 1;
    else if (sort === "high-low") sortOption.price = -1;
    else if (sort === "popularity") sortOption.rating = -1;
    else sortOption.createdAt = -1;

    /* ---------- PAGINATION ---------- */

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
        status: "success",
        results: products.length,
        totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / limit),
        products,
    });
});

/* ================= GET A PRODUCT BY ID================= */

exports.getProductById = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new customError("Product not found", 404));
    }

    res.status(200).json({
        status: "success",
        product,
    });
});

/* ================= GET SIMILAR PRODUCTS ================= */

exports.getSimilarProducts = asyncErrorHandler(async (req, res, next) => {
    const productId = req.params.id;

    // Get the current product
    const product = await Product.findById(productId);

    if (!product) {
        return next(new customError("Product not found", 404));
    }

    // Find similar products
    const similarProducts = await Product.find({
        _id: { $ne: product._id }, // exclude current product
        category: product.category,
        gender: product.gender,
        isPublished: true,
    })
    .limit(8)
    .sort({ createdAt: -1 });

    res.status(200).json({
        status: "success",
        results: similarProducts.length,
        similarProducts,
    });
});

/* ================= GET HIGHEST RATED PRODUCT (BEST SELLER) ================= */
 
exports.getHighestRatedProduct = asyncErrorHandler( async(req, res, next) => {

    const bestSeller = await Product.findOne({ isPublished: true }).sort({ rating: -1});

    if( !bestSeller ){
        return next(new customError("No best seller found.", 404));
    }

    res.status(200).json({
        status: "success",
        bestSeller
    });

});

/* ================= GET NEW ARRIVALS ================= */

exports.getNewArrivals = asyncErrorHandler(async (req, res, next) => {
    const newArrivals = await Product.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(8);

    if (!newArrivals || newArrivals.length === 0) {
        return next(new customError("No new arrivals found.", 404));
    }

    res.status(200).json({
        status: "success",
        results: newArrivals.length,
        newArrivals,
    });
});




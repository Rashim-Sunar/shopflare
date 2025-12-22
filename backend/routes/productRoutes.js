const express = require('express');
const productController = require('../controllers/productController')
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @route POST /api/products
// @desc Create a new product
// @access Private/Admin
router.post('/', protect, productController.createProduct);

// @ route PUT /api/products/:id
// @ desc Update an existing product
// @ access Private/Admin
router.put('/:id', protect, productController.updateProduct);

// @ route DELETE /api/products/:id
// @ desc delete given product
// @ access Private/Admin
router.delete('/:id', protect, productController.deleteProduct);

// @ route GET /api/products
// @ desc get all products by oprtional query filters
// @ access Public
router.get('/', productController.getAllProducts);

// @route GET /api/products/best-seller
// @desc Retrieve the product with the highest rating
// @access Public
router.get('/best-seller', productController.getHighestRatedProduct);

// @route GET /api/products/new-arrivals
// @desc Retrieve latest 8 products - Creation date
// @access Public
router.get('/new-arrivals', productController.getNewArrivals);

// @ route GET /api/products/:id
// @ desc get a product by id
// @ access Public
router.get('/:id', productController.getProductById);

// @route GET /api/products/similar/:id
// @desc Retrieve similar products based on the current product's gender and category
// @ access Public 
router.get('/similar/:id', productController.getSimilarProducts);

module.exports = router;
const express = require('express');
const productController = require('../controllers/productController')
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

// @route POST /api/prodcuts
// @desc Create a new product
// @access Private/Admin
router.post('/', protect, productController.createProduct);

module.exports = router;
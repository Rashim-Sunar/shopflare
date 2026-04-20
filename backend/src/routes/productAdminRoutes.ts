import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/roleMiddleware';
import { UserRole } from '../types/auth';
import { createProduct, updateProduct, deleteProduct, getAllProducts } from '../controllers/productController';

/**
 * @fileoverview Admin product management routes for catalog creation and modification.
 */

const router = Router();

/**
 * @route GET /api/admin/products
 * @description Retrieves all products in the catalog (admin access).
 * @access Private - Admin only
 */
router.get('/', protect, restrictTo([UserRole.Admin]), getAllProducts);

/**
 * @route POST /api/admin/products
 * @description Creates a new product in the catalog.
 * @access Private - Admin only
 */
router.post('/', protect, restrictTo([UserRole.Admin]), createProduct);

/**
 * @route PUT /api/admin/products/:id
 * @description Updates an existing product's fields.
 * @access Private - Admin only
 */
router.put('/:id', protect, restrictTo([UserRole.Admin]), updateProduct);

/**
 * @route DELETE /api/admin/products/:id
 * @description Removes a product from the catalog.
 * @access Private - Admin only
 */
router.delete('/:id', protect, restrictTo([UserRole.Admin]), deleteProduct);

export default router;

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/roleMiddleware';
import { UserRole } from '../types/auth';
import { policyPdfUpload } from '../config/policyUpload';
import { getCustomerRightsDocuments, uploadCustomerRightsDocument, updateCustomerRightsDocumentStatus } from '../controllers/customerRightsController';

/**
 * @fileoverview Admin customer-rights document management routes.
 */

const router = Router();

router.get('/', protect, restrictTo([UserRole.Admin]), getCustomerRightsDocuments);

router.post('/upload', protect, restrictTo([UserRole.Admin]), policyPdfUpload.single('policyPdf'), uploadCustomerRightsDocument);

router.patch('/:id/status', updateCustomerRightsDocumentStatus);

export default router;

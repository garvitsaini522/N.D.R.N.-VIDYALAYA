import { Router } from 'express';
import {
  getPublishedFees,
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  togglePublish,
} from '../controllers/feeStructureController.js';
import {
  createFeeStructureRules,
  updateFeeStructureRules,
} from '../validators/feeStructureValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public: Get published fee structure for public Admissions page
router.get('/', requireDatabase, getPublishedFees);

// Admin: Get all fee structure records (published and draft)
router.get('/admin', authenticate, authorize('admin', 'staff'), requireDatabase, getAllFees);

// Admin: Get single fee structure record
router.get('/:id', authenticate, authorize('admin', 'staff'), requireDatabase, getFeeById);

// Admin: Create new class fee structure
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createFeeStructureRules,
  validate,
  requireDatabase,
  createFee
);

// Admin: Update fee structure record
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateFeeStructureRules,
  validate,
  requireDatabase,
  updateFee
);

// Admin: Delete fee structure record
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteFee);

// Admin: Toggle publish status
router.patch('/:id/publish', authenticate, authorize('admin'), requireDatabase, togglePublish);

export default router;

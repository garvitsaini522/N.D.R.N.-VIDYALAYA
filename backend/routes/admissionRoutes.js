import { Router } from 'express';
import {
  submitEnquiry,
  getEnquiries,
  getEnquiryById,
  updateStatus,
  deleteEnquiry,
} from '../controllers/admissionController.js';
import {
  admissionEnquiryRules,
  updateAdmissionStatusRules,
} from '../validators/admissionValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public route: submit enquiry
// POST /api/admissions/enquire
router.post('/enquire', admissionEnquiryRules, validate, requireDatabase, submitEnquiry);

// Staff/Admin routes
// GET /api/admissions
router.get('/', authenticate, authorize('admin', 'staff'), requireDatabase, getEnquiries);

// GET /api/admissions/:id
router.get('/:id', authenticate, authorize('admin', 'staff'), requireDatabase, getEnquiryById);

// PATCH /api/admissions/:id/status
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'staff'),
  updateAdmissionStatusRules,
  validate,
  requireDatabase,
  updateStatus
);

// DELETE /api/admissions/:id
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteEnquiry);

export default router;

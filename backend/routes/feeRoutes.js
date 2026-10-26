import { Router } from 'express';
import {
  getFees,
  createFee,
  recordPayment,
  getStudentLedger,
} from '../controllers/feeController.js';
import { createFeeRules, recordPaymentRules } from '../validators/feeValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceStudentOrParentDataIsolation } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// GET /api/fees
router.get('/', authenticate, authorize('admin', 'staff'), requireDatabase, getFees);

// POST /api/fees - Create fee invoice (Admin/Staff only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'staff'),
  createFeeRules,
  validate,
  requireDatabase,
  createFee
);

// POST /api/fees/:id/payment - Record payment (Admin/Staff only)
router.post(
  '/:id/payment',
  authenticate,
  authorize('admin', 'staff'),
  recordPaymentRules,
  validate,
  requireDatabase,
  recordPayment
);

// GET /api/fees/student/:studentId - Get student fee ledger (Protected by student/parent isolation)
router.get(
  '/student/:studentId',
  authenticate,
  enforceStudentOrParentDataIsolation,
  requireDatabase,
  getStudentLedger
);

export default router;

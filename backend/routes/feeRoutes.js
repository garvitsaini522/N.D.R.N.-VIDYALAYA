import { Router } from 'express';
import {
  getFees,
  createFee,
  recordPayment,
  getGatewayStatus,
  payFee,
  verifyPayment,
  getStudentLedger,
} from '../controllers/feeController.js';
import { createFeeRules, recordPaymentRules } from '../validators/feeValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceStudentOrParentDataIsolation } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// GET /api/fees/gateway-status - Payment gateway configuration and offline instructions
router.get(
  '/gateway-status',
  authenticate,
  authorize('admin', 'staff', 'student', 'parent'),
  getGatewayStatus
);

// GET /api/fees - Administrative ledger query
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

// POST /api/fees/pay - Process online fee payment initiation (Student/Parent) or admin collection (Admin/Staff)
router.post(
  '/pay',
  authenticate,
  authorize('admin', 'staff', 'student', 'parent'),
  enforceStudentOrParentDataIsolation,
  requireDatabase,
  payFee
);

// POST /api/fees/verify - Verify gateway payment cryptographically
router.post(
  '/verify',
  authenticate,
  authorize('admin', 'staff', 'student', 'parent'),
  requireDatabase,
  verifyPayment
);

// GET /api/fees/student/:studentId - Get student fee ledger (Protected by student/parent isolation)
router.get(
  '/student/:studentId',
  authenticate,
  authorize('admin', 'staff', 'student', 'parent'),
  enforceStudentOrParentDataIsolation,
  requireDatabase,
  getStudentLedger
);

export default router;

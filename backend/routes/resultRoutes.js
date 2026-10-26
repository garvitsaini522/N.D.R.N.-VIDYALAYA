import { Router } from 'express';
import { getResults, publishResult } from '../controllers/resultController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceStudentOrParentDataIsolation } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// GET /api/results (Enforces student & parent data isolation)
router.get('/', authenticate, enforceStudentOrParentDataIsolation, requireDatabase, getResults);

// POST /api/results (Faculty/Admin only - Protected academic records)
router.post('/', authenticate, authorize('admin', 'teacher'), requireDatabase, publishResult);

export default router;

import { Router } from 'express';
import { getClasses, getClassById, createClass } from '../controllers/classController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// GET /api/classes
router.get('/', requireDatabase, getClasses);

// GET /api/classes/:id
router.get('/:id', requireDatabase, getClassById);

// POST /api/classes (Admin only)
router.post('/', authenticate, authorize('admin'), requireDatabase, createClass);

export default router;

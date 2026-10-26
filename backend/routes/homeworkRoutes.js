import { Router } from 'express';
import {
  getHomework,
  createHomework,
  updateHomework,
} from '../controllers/homeworkController.js';
import { createHomeworkRules } from '../validators/homeworkValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// GET /api/homework
router.get('/', authenticate, requireDatabase, getHomework);

// POST /api/homework
router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  createHomeworkRules,
  validate,
  requireDatabase,
  createHomework
);

// PUT /api/homework/:id
router.put('/:id', authenticate, authorize('admin', 'teacher'), requireDatabase, updateHomework);

export default router;

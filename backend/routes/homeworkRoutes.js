import { Router } from 'express';
import {
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  submitHomework,
  getHomeworkSubmissions,
} from '../controllers/homeworkController.js';
import { createHomeworkRules } from '../validators/homeworkValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// GET /api/homework (Role-scoped homework listing)
router.get('/', authenticate, requireDatabase, getHomework);

// POST /api/homework (Issue homework - Faculty & Admin)
router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  createHomeworkRules,
  validate,
  requireDatabase,
  createHomework
);

// POST /api/homework/:id/submit (Student / Parent homework submission to MongoDB)
router.post('/:id/submit', authenticate, requireDatabase, submitHomework);

// GET /api/homework/:id/submissions (Submissions roster - Faculty & Admin)
router.get('/:id/submissions', authenticate, authorize('admin', 'teacher'), requireDatabase, getHomeworkSubmissions);

// PUT /api/homework/:id (Update task - Faculty & Admin)
router.put('/:id', authenticate, authorize('admin', 'teacher'), requireDatabase, updateHomework);

// DELETE /api/homework/:id (Delete task - Faculty & Admin)
router.delete('/:id', authenticate, authorize('admin', 'teacher'), requireDatabase, deleteHomework);

export default router;

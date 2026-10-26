import { Router } from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
} from '../controllers/teacherController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public route: list faculty educators
// GET /api/teachers
router.get('/', requireDatabase, getTeachers);

// GET /api/teachers/:id
router.get('/:id', requireDatabase, getTeacherById);

// Admin routes
// POST /api/teachers
router.post('/', authenticate, authorize('admin'), requireDatabase, createTeacher);

// PUT /api/teachers/:id
router.put('/:id', authenticate, authorize('admin'), requireDatabase, updateTeacher);

export default router;

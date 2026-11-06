import { Router } from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public route: list faculty educators (optionalAuth enables full view for authenticated admins)
// GET /api/teachers
router.get('/', optionalAuth, requireDatabase, getTeachers);

// GET /api/teachers/:id (Public view or authenticated teacher/admin view)
router.get('/:id', optionalAuth, requireDatabase, getTeacherById);

// Admin routes
// POST /api/teachers
router.post('/', authenticate, authorize('admin'), requireDatabase, createTeacher);

// PUT /api/teachers/:id (Admin and Teacher)
router.put('/:id', authenticate, authorize('admin', 'teacher'), requireDatabase, updateTeacher);

// DELETE /api/teachers/:id (Admin only)
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteTeacher);

export default router;

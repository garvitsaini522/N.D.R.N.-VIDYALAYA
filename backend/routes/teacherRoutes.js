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
router.get(
  '/:id',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    next();
  },
  requireDatabase,
  getTeacherById
);

// Admin routes
// POST /api/teachers
router.post('/', authenticate, authorize('admin'), requireDatabase, createTeacher);

// PUT /api/teachers/:id (Admin and Teacher)
router.put('/:id', authenticate, authorize('admin', 'teacher'), requireDatabase, updateTeacher);

export default router;

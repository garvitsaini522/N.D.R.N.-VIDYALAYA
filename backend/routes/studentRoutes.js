import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceStudentOrParentDataIsolation } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// GET /api/students (Administrative roster query)
router.get('/', authenticate, authorize('admin', 'teacher', 'staff'), requireDatabase, getStudents);

// GET /api/students/:id (Enforces student & parent data isolation)
router.get('/:id', authenticate, enforceStudentOrParentDataIsolation, requireDatabase, getStudentById);

// POST /api/students (Admin only)
router.post('/', authenticate, authorize('admin'), requireDatabase, createStudent);

// PUT /api/students/:id (Admin only)
router.put('/:id', authenticate, authorize('admin'), requireDatabase, updateStudent);

export default router;

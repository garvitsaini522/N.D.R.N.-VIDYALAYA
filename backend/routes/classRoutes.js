import { Router } from 'express';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/classController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// GET /api/classes
router.get('/', requireDatabase, getClasses);

// GET /api/classes/:id
router.get('/:id', requireDatabase, getClassById);

// POST /api/classes (Admin only)
router.post('/', authenticate, authorize('admin'), requireDatabase, createClass);

// PUT /api/classes/:id (Admin only)
router.put('/:id', authenticate, authorize('admin'), requireDatabase, updateClass);

// DELETE /api/classes/:id (Admin only)
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteClass);

export default router;

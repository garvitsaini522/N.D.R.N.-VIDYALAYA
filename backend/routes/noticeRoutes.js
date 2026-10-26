import { Router } from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { createNoticeRules } from '../validators/noticeValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public routes
// GET /api/notices
router.get('/', requireDatabase, getNotices);

// GET /api/notices/:id
router.get('/:id', requireDatabase, getNoticeById);

// Staff/Admin routes
// POST /api/notices
router.post(
  '/',
  authenticate,
  authorize('admin', 'staff'),
  createNoticeRules,
  validate,
  requireDatabase,
  createNotice
);

// PUT /api/notices/:id
router.put('/:id', authenticate, authorize('admin', 'staff'), requireDatabase, updateNotice);

// DELETE /api/notices/:id
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteNotice);

export default router;

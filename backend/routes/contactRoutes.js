import { Router } from 'express';
import {
  submitContactMessage,
  getContactMessages,
  markAsRead,
  deleteMessage,
} from '../controllers/contactController.js';
import { contactMessageRules } from '../validators/contactValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public route: submit message
// POST /api/contact
router.post('/', contactMessageRules, validate, requireDatabase, submitContactMessage);

// Admin routes
// GET /api/contact
router.get('/', authenticate, authorize('admin'), requireDatabase, getContactMessages);

// PATCH /api/contact/:id/read
router.patch('/:id/read', authenticate, authorize('admin'), requireDatabase, markAsRead);

// DELETE /api/contact/:id
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteMessage);

export default router;

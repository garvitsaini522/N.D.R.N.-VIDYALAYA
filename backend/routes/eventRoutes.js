import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public routes
// GET /api/events
router.get('/', requireDatabase, getEvents);

// GET /api/events/:id
router.get('/:id', requireDatabase, getEventById);

// Admin routes
// POST /api/events
router.post('/', authenticate, authorize('admin'), requireDatabase, createEvent);

// PUT /api/events/:id
router.put('/:id', authenticate, authorize('admin'), requireDatabase, updateEvent);

// DELETE /api/events/:id
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteEvent);

export default router;

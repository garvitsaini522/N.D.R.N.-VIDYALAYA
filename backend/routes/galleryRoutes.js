import { Router } from 'express';
import {
  getGallery,
  createGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public route: GET /api/gallery
router.get('/', requireDatabase, getGallery);

// Admin routes
// POST /api/gallery
router.post('/', authenticate, authorize('admin'), requireDatabase, createGalleryItem);

// DELETE /api/gallery/:id
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteGalleryItem);

export default router;

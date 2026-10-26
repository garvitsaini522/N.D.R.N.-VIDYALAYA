import { Router } from 'express';
import {
  getPublishedCourses,
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
} from '../controllers/courseController.js';
import {
  createCourseRules,
  updateCourseRules,
} from '../validators/courseValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// Public: Get published courses for the Academic section
router.get('/', requireDatabase, getPublishedCourses);

// Admin: Get all course records (published and draft)
router.get('/admin', authenticate, authorize('admin', 'staff'), requireDatabase, getAllCourses);

// Admin: Get single course record
router.get('/:id', authenticate, authorize('admin', 'staff'), requireDatabase, getCourseById);

// Admin: Create new class course specifications
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createCourseRules,
  validate,
  requireDatabase,
  createCourse
);

// Admin: Update course record
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateCourseRules,
  validate,
  requireDatabase,
  updateCourse
);

// Admin: Delete course record
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteCourse);

// Admin: Toggle publish status
router.patch('/:id/publish', authenticate, authorize('admin'), requireDatabase, togglePublish);

export default router;

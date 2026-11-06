import { Router } from 'express';
import {
  getTimetable,
  getTeacherTimetable,
  setTimetable,
  deleteTimetable,
} from '../controllers/timetableController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// GET /api/timetable/teacher (Faculty weekly teaching routine)
router.get(
  '/teacher',
  authenticate,
  authorize('teacher', 'admin'),
  requireDatabase,
  getTeacherTimetable
);

// GET /api/timetable/class/:classId (Class cohort routine - role scoped)
router.get(
  '/class/:classId',
  authenticate,
  requireDatabase,
  getTimetable
);

// POST /api/timetable/class/:classId (Administrator configuration)
router.post(
  '/class/:classId',
  authenticate,
  authorize('admin'),
  requireDatabase,
  setTimetable
);

// DELETE /api/timetable/class/:classId (Administrator reset)
router.delete(
  '/class/:classId',
  authenticate,
  authorize('admin'),
  requireDatabase,
  deleteTimetable
);

export default router;

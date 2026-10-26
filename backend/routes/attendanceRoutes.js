import { Router } from 'express';
import {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
} from '../controllers/attendanceController.js';
import { markAttendanceRules } from '../validators/attendanceValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceStudentOrParentDataIsolation } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// POST /api/attendance - Mark attendance for class
router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher', 'staff'),
  markAttendanceRules,
  validate,
  requireDatabase,
  markAttendance
);

// GET /api/attendance/student/:studentId (Protected by student/parent isolation)
router.get(
  '/student/:studentId',
  authenticate,
  enforceStudentOrParentDataIsolation,
  requireDatabase,
  getStudentAttendance
);

// GET /api/attendance/class/:classId
router.get(
  '/class/:classId',
  authenticate,
  authorize('admin', 'teacher', 'staff'),
  requireDatabase,
  getClassAttendance
);

export default router;

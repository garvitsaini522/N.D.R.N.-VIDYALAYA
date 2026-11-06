import { Router } from 'express';
import {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  getClassAttendanceHistory,
} from '../controllers/attendanceController.js';
import { markAttendanceRules } from '../validators/attendanceValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceStudentOrParentDataIsolation } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// POST /api/attendance - Mark attendance for class (Faculty & Admin)
router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher', 'staff'),
  markAttendanceRules,
  validate,
  enforceStudentOrParentDataIsolation,
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

// GET /api/attendance/class/:classId/history (Aggregated class historical registers)
router.get(
  '/class/:classId/history',
  authenticate,
  authorize('admin', 'teacher', 'staff'),
  enforceStudentOrParentDataIsolation,
  requireDatabase,
  getClassAttendanceHistory
);

// GET /api/attendance/class/:classId (Teacher class scoping & Admin daily register)
router.get(
  '/class/:classId',
  authenticate,
  authorize('admin', 'teacher', 'staff'),
  enforceStudentOrParentDataIsolation,
  requireDatabase,
  getClassAttendance
);

export default router;

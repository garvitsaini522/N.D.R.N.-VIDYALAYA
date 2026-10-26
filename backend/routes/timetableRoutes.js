import { Router } from 'express';
import { getTimetable, setTimetable } from '../controllers/timetableController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// GET /api/timetable/class/:classId
router.get('/class/:classId', requireDatabase, getTimetable);

// POST /api/timetable/class/:classId (Admin only)
router.post('/class/:classId', authenticate, authorize('admin'), requireDatabase, setTimetable);

export default router;

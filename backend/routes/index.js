import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import admissionRoutes from './admissionRoutes.js';
import contactRoutes from './contactRoutes.js';
import noticeRoutes from './noticeRoutes.js';
import eventRoutes from './eventRoutes.js';
import galleryRoutes from './galleryRoutes.js';
import classRoutes from './classRoutes.js';
import studentRoutes from './studentRoutes.js';
import parentRoutes from './parentRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import homeworkRoutes from './homeworkRoutes.js';
import resultRoutes from './resultRoutes.js';
import feeRoutes from './feeRoutes.js';
import feeStructureRoutes from './feeStructureRoutes.js';
import courseRoutes from './courseRoutes.js';
import timetableRoutes from './timetableRoutes.js';

const apiRouter = Router();

// Health check (always accessible, does not block when DB is connecting or disconnected)
apiRouter.use('/health', healthRoutes);

// Authentication & Users
apiRouter.use('/auth', authRoutes);

// Public School Services & Operations
apiRouter.use('/admissions', admissionRoutes);
apiRouter.use('/contact', contactRoutes);
apiRouter.use('/notices', noticeRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/gallery', galleryRoutes);
apiRouter.use('/fee-structure', feeStructureRoutes);
apiRouter.use('/courses', courseRoutes);

// Academic Management
apiRouter.use('/classes', classRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/parents', parentRoutes);
apiRouter.use('/teachers', teacherRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/homework', homeworkRoutes);
apiRouter.use('/results', resultRoutes);
apiRouter.use('/fees', feeRoutes);
apiRouter.use('/timetable', timetableRoutes);

export default apiRouter;

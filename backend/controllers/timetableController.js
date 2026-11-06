import mongoose from 'mongoose';
import { Timetable } from '../models/Timetable.js';
import { Class } from '../models/Class.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { getKolkataDayOfWeek } from '../utils/timezone.js';
import { sanitizeTimetablePeriods, sanitizeEnumQuery } from '../utils/privacySanitizer.js';

/**
 * Resolve a class identifier (ObjectId, class name string like 'Class 5', or 'Class 5-A')
 */
async function resolveClassDoc(identifier) {
  if (!identifier) return null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const doc = await Class.findById(identifier);
    if (doc) return doc;
  }
  const cleanName = identifier.split('-')[0].trim();
  return await Class.findOne({ name: cleanName });
}

/**
 * GET /api/timetable/class/:classId
 * Retrieve timetable for a specific class cohort, optionally filtered by day of week
 */
export async function getTimetable(req, res, next) {
  try {
    const { classId } = req.params;
    const { day } = req.query;

    const classDoc = await resolveClassDoc(classId);
    if (!classDoc) {
      throw ApiError.notFound(`Class cohort '${classId}' not found in database.`);
    }

    // Role-based authorization & scoping (Requirement 4)
    if (req.user) {
      const { role, assignedClasses, wing, studentId, wardIds } = req.user;

      if (role === 'teacher' && wing !== 'Administration') {
        const allowed = (assignedClasses || []).map((c) => c.toString());
        if (!allowed.includes(classDoc._id.toString())) {
          throw ApiError.forbidden(
            'Forbidden: Teachers are only permitted to view timetables for their assigned classes.'
          );
        }
      } else if (role === 'student') {
        if (!studentId) {
          throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
        }
        const student = await Student.findById(studentId).select('class').lean();
        if (!student || student.class?.toString() !== classDoc._id.toString()) {
          throw ApiError.forbidden('Forbidden: Students can only view their own class timetable.');
        }
      } else if (role === 'parent') {
        if (!wardIds || wardIds.length === 0) {
          throw ApiError.forbidden('Forbidden: Parent account is not linked to any verified student records.');
        }
        const wards = await Student.find({ _id: { $in: wardIds } }).select('class').lean();
        const wardClassIds = wards.map((w) => w.class?.toString());
        if (!wardClassIds.includes(classDoc._id.toString())) {
          throw ApiError.forbidden('Forbidden: Parents can only view timetables for their linked wards.');
        }
      }
    }

    const validDay = sanitizeEnumQuery(
      day,
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All'],
      null
    );

    const query = { class: classDoc._id };
    if (validDay && validDay !== 'All') {
      query.dayOfWeek = validDay;
    }

    const rawSchedule = await Timetable.find(query)
      .populate('class', 'name section roomNumber academicYear')
      .populate('periods.teacher', 'fullName designation')
      .sort({ dayOfWeek: 1 })
      .lean();

    const schedule = rawSchedule.map((s) => ({
      ...s,
      periods: sanitizeTimetablePeriods(s.periods),
    }));

    return ApiResponse.success(res, schedule, 'Class timetable schedule retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/timetable/teacher
 * Retrieve weekly teaching periods and routine for the authenticated teacher across assigned classes
 */
export async function getTeacherTimetable(req, res, next) {
  try {
    const { day } = req.query;
    const teacherUser = req.user;

    let teacherId = null;
    let assignedClasses = [];

    if (teacherUser.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: teacherUser.id }).lean();
      if (teacherDoc) {
        teacherId = teacherDoc._id;
        assignedClasses = teacherDoc.assignedClasses || [];
      } else {
        assignedClasses = teacherUser.assignedClasses || [];
      }
    } else if (teacherUser.role === 'admin') {
      // Admins can inspect any teacher or general schedule
      if (req.query.teacherId && mongoose.Types.ObjectId.isValid(req.query.teacherId)) {
        teacherId = new mongoose.Types.ObjectId(req.query.teacherId);
      }
    } else {
      throw ApiError.forbidden('Forbidden: Only educators and administrators can access faculty timetables.');
    }

    const query = {};
    if (assignedClasses.length > 0) {
      query.class = { $in: assignedClasses };
    }
    if (day && day !== 'All') {
      query.dayOfWeek = day;
    }

    const timetables = await Timetable.find(query)
      .populate('class', 'name section roomNumber')
      .populate('periods.teacher', 'fullName employeeId designation')
      .sort({ dayOfWeek: 1 })
      .lean();

    // Flatten and extract periods for this teacher across assigned classes
    const teachingRoster = [];
    timetables.forEach((daySchedule) => {
      (daySchedule.periods || []).forEach((period) => {
        const periodTeacherId = period.teacher?._id?.toString() || period.teacher?.toString();
        const matchesTeacher = !teacherId || periodTeacherId === teacherId.toString();

        if (matchesTeacher || assignedClasses.map((c) => c.toString()).includes(daySchedule.class?._id?.toString())) {
          teachingRoster.push({
            id: `${daySchedule._id}-${period.periodNumber}`,
            dayOfWeek: daySchedule.dayOfWeek,
            period: period.periodNumber,
            startTime: period.startTime,
            endTime: period.endTime,
            time: `${period.startTime} - ${period.endTime}`,
            subject: period.subject,
            grade: daySchedule.class ? `${daySchedule.class.name} - Section ${daySchedule.class.section}` : 'Primary Cohort',
            classId: daySchedule.class?._id,
            room: period.room || daySchedule.class?.roomNumber || 'Room 101',
            teacher: period.teacher?.fullName || 'Assigned Faculty',
            notes: period.notes || '',
          });
        }
      });
    });

    // Sort by period number
    teachingRoster.sort((a, b) => a.period - b.period);

    return ApiResponse.success(res, teachingRoster, 'Teacher routine retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/timetable/class/:classId
 * Configure or update weekly period schedule for a class cohort (Administrator only)
 */
export async function setTimetable(req, res, next) {
  try {
    const { classId } = req.params;
    const { dayOfWeek, periods } = req.body;

    const classDoc = await resolveClassDoc(classId);
    if (!classDoc) {
      throw ApiError.notFound(`Class cohort '${classId}' not found in database.`);
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!dayOfWeek || !validDays.includes(dayOfWeek)) {
      throw ApiError.badRequest(`Invalid day of week '${dayOfWeek}'. Allowed: ${validDays.join(', ')}`);
    }

    if (!Array.isArray(periods)) {
      throw ApiError.badRequest('Periods must be an array of scheduled instructional periods.');
    }

    // Validate period entries
    const sanitizedPeriods = [];
    for (const p of periods) {
      if (!p.periodNumber || p.periodNumber < 1 || p.periodNumber > 10) {
        throw ApiError.badRequest('Each period must have a periodNumber between 1 and 10.');
      }
      if (!p.startTime || !p.endTime) {
        throw ApiError.badRequest(`Period ${p.periodNumber} requires valid startTime and endTime.`);
      }
      if (!p.subject || !p.subject.trim()) {
        throw ApiError.badRequest(`Period ${p.periodNumber} requires a subject.`);
      }

      let teacherId = null;
      if (p.teacher) {
        if (mongoose.Types.ObjectId.isValid(p.teacher)) {
          teacherId = p.teacher;
        } else {
          const teacherDoc = await Teacher.findOne({ fullName: p.teacher });
          if (teacherDoc) teacherId = teacherDoc._id;
        }
      }

      sanitizedPeriods.push({
        periodNumber: p.periodNumber,
        startTime: p.startTime.trim(),
        endTime: p.endTime.trim(),
        subject: p.subject.trim(),
        teacher: teacherId,
        room: p.room ? p.room.trim() : (classDoc.roomNumber || ''),
        notes: p.notes ? p.notes.trim() : '',
      });
    }

    // Sort periods sequentially by period number
    sanitizedPeriods.sort((a, b) => a.periodNumber - b.periodNumber);

    const schedule = await Timetable.findOneAndUpdate(
      { class: classDoc._id, dayOfWeek },
      { class: classDoc._id, dayOfWeek, periods: sanitizedPeriods },
      { new: true, upsert: true, runValidators: true }
    )
      .populate('class', 'name section')
      .populate('periods.teacher', 'fullName employeeId designation');

    return ApiResponse.success(res, schedule, 'Class timetable saved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/timetable/class/:classId
 * Clear timetable schedule for a class or specific day (Administrator only)
 */
export async function deleteTimetable(req, res, next) {
  try {
    const { classId } = req.params;
    const { day } = req.query;

    const classDoc = await resolveClassDoc(classId);
    if (!classDoc) {
      throw ApiError.notFound(`Class cohort '${classId}' not found.`);
    }

    const filter = { class: classDoc._id };
    if (day) filter.dayOfWeek = day;

    const result = await Timetable.deleteMany(filter);
    return ApiResponse.success(res, result, 'Timetable schedule cleared successfully');
  } catch (error) {
    next(error);
  }
}

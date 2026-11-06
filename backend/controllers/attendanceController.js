import mongoose from 'mongoose';
import { AttendanceService } from '../services/attendanceService.js';
import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function markAttendance(req, res, next) {
  try {
    const { classId, date, records } = req.body;

    if (!classId) {
      throw ApiError.badRequest('Class ID is required');
    }

    // Faculty assignment check: teachers can only record attendance for assigned classes
    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (assignedClasses.length === 0 || !assignedClasses.includes(classId.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to mark attendance for their assigned classes.');
      }
    }

    const attendanceRecords = Array.isArray(records) ? records : [];
    const result = await AttendanceService.recordClassAttendance(
      classId,
      date || new Date(),
      attendanceRecords,
      req.user?.id
    );

    return ApiResponse.success(res, result, 'Attendance recorded successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStudentAttendance(req, res, next) {
  try {
    let { studentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!studentId || studentId === 'me') {
      if (req.user?.role === 'student') {
        studentId = req.user.studentId;
      } else if (req.user?.role === 'parent' && Array.isArray(req.user.wardIds) && req.user.wardIds.length > 0) {
        studentId = req.user.wardIds[0];
      }
    }

    if (!studentId) {
      throw ApiError.badRequest('Student identifier is required');
    }

    // Role-based access validation
    const role = req.user?.role;
    if (role === 'student') {
      if (!req.user.isLinked || !req.user.studentId) {
        throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
      }
      const isSelf =
        studentId.toString() === req.user.studentId.toString() ||
        (req.user.admissionNumber && studentId.toUpperCase() === req.user.admissionNumber.toUpperCase());
      if (!isSelf) {
        throw ApiError.forbidden('Forbidden: Students can only view their own attendance records.');
      }
      studentId = req.user.studentId;
    } else if (role === 'parent') {
      if (!req.user.isLinked || !Array.isArray(req.user.wardIds) || req.user.wardIds.length === 0) {
        throw ApiError.forbidden('Forbidden: Parent account is not linked to any official student record.');
      }
      const allowedWards = req.user.wardIds.map((id) => id.toString());
      let resolvedStudentId = studentId;
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        const studentDoc = await Student.findOne({
          _id: { $in: allowedWards },
          admissionNumber: studentId.toUpperCase(),
        }).select('_id').lean();
        if (studentDoc) {
          resolvedStudentId = studentDoc._id.toString();
        }
      }
      const isAllowed = allowedWards.includes(resolvedStudentId.toString());
      if (!isAllowed) {
        throw ApiError.forbidden('Forbidden: Parents can only view attendance for their verified linked children.');
      }
      studentId = resolvedStudentId;
    } else if (role === 'teacher' && req.user.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      const student = await Student.findById(studentId).select('class').lean();
      if (!student) {
        throw ApiError.notFound('Student record not found');
      }
      const studentClassId = student.class ? student.class.toString() : null;
      if (!studentClassId || !assignedClasses.includes(studentClassId)) {
        throw ApiError.forbidden('Forbidden: Teachers can only view attendance for students in their assigned classes.');
      }
    }

    const data = await AttendanceService.getStudentAttendance(studentId, startDate, endDate);
    return ApiResponse.success(res, data, 'Student attendance retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getClassAttendance(req, res, next) {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      throw ApiError.badRequest('Invalid class ID');
    }

    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (assignedClasses.length === 0 || !assignedClasses.includes(classId.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to view attendance for their assigned classes.');
      }
    }

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setUTCHours(0, 0, 0, 0);

    const records = await Attendance.find({ class: classId, date: queryDate })
      .populate('student', 'fullName admissionNumber rollNumber gender')
      .sort({ 'student.rollNumber': 1 })
      .lean();

    return ApiResponse.success(res, records, 'Class attendance list retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getClassAttendanceHistory(req, res, next) {
  try {
    const { classId } = req.params;
    const { limit = 30 } = req.query;

    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      throw ApiError.badRequest('Invalid class ID');
    }

    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (assignedClasses.length === 0 || !assignedClasses.includes(classId.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to view attendance history for their assigned classes.');
      }
    }

    const history = await AttendanceService.getClassAttendanceHistory(classId, parseInt(limit, 10));
    return ApiResponse.success(res, history, 'Class attendance history retrieved');
  } catch (error) {
    next(error);
  }
}

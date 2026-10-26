import { AttendanceService } from '../services/attendanceService.js';
import { Attendance } from '../models/Attendance.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function markAttendance(req, res, next) {
  try {
    const { classId, date, records } = req.body;
    const result = await AttendanceService.recordClassAttendance(
      classId,
      date,
      records,
      req.user?.id
    );

    return ApiResponse.success(res, result, 'Attendance recorded successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStudentAttendance(req, res, next) {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

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

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setUTCHours(0, 0, 0, 0);

    const records = await Attendance.find({ class: classId, date: queryDate })
      .populate('student', 'fullName admissionNumber rollNumber')
      .sort({ 'student.rollNumber': 1 });

    return ApiResponse.success(res, records, 'Class attendance list retrieved');
  } catch (error) {
    next(error);
  }
}

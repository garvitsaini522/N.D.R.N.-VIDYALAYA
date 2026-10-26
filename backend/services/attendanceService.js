import { Attendance } from '../models/Attendance.js';
import { ApiError } from '../utils/apiError.js';

export class AttendanceService {
  /**
   * Bulk mark attendance for a class on a given date
   */
  static async recordClassAttendance(classId, date, records, markedBy) {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);

    const bulkOps = records.map((record) => ({
      updateOne: {
        filter: {
          student: record.studentId,
          date: formattedDate,
        },
        update: {
          $set: {
            class: classId,
            status: record.status,
            remarks: record.remarks || '',
            markedBy,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(bulkOps);
    return {
      date: formattedDate,
      classId,
      processedCount: records.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Get attendance for a specific student across date range or month
   */
  static async getStudentAttendance(studentId, startDate, endDate) {
    const query = { student: studentId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const attendancePercentage = totalDays > 0 ? parseFloat(((presentDays / totalDays) * 100).toFixed(1)) : 100;

    return {
      studentId,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage,
      },
      records,
    };
  }
}

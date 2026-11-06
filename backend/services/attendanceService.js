import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';
import { ApiError } from '../utils/apiError.js';

export class AttendanceService {
  /**
   * Bulk mark attendance for a class on a given date
   * Enforces verified MongoDB class ID and student IDs, validates class enrollment,
   * prevents duplicates via compound upsert, and returns verified metrics.
   */
  static async recordClassAttendance(classId, date, records, markedBy) {
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      throw ApiError.badRequest('Valid Class ID is required');
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      throw ApiError.notFound('Class cohort not found');
    }

    const formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      throw ApiError.badRequest('Valid attendance date is required');
    }
    formattedDate.setUTCHours(0, 0, 0, 0);

    if (!Array.isArray(records) || records.length === 0) {
      throw ApiError.badRequest('Attendance records array must not be empty');
    }

    // Deduplicate incoming student records by studentId to prevent duplicate entries
    const seenStudentIds = new Set();
    const uniqueRecords = [];
    for (const r of records) {
      if (!r.studentId || !mongoose.Types.ObjectId.isValid(r.studentId)) {
        throw ApiError.badRequest(`Invalid student ID in record: ${r.studentId}`);
      }
      const sid = r.studentId.toString();
      if (!seenStudentIds.has(sid)) {
        seenStudentIds.add(sid);
        uniqueRecords.push(r);
      }
    }

    // Verify all students exist in MongoDB
    const studentIds = uniqueRecords.map((r) => new mongoose.Types.ObjectId(r.studentId));
    const students = await Student.find({ _id: { $in: studentIds } }).select('_id class fullName admissionNumber rollNumber');

    if (students.length !== uniqueRecords.length) {
      const foundIds = new Set(students.map((s) => s._id.toString()));
      const missingIds = uniqueRecords
        .filter((r) => !foundIds.has(r.studentId.toString()))
        .map((r) => r.studentId);
      throw ApiError.notFound(`One or more students not found in database: ${missingIds.join(', ')}`);
    }

    // Validate that each student belongs to the selected class cohort
    const targetClassIdStr = classDoc._id.toString();
    for (const s of students) {
      const studentClassStr = s.class ? s.class.toString() : null;
      if (studentClassStr !== targetClassIdStr) {
        throw ApiError.badRequest(
          `Student ${s.fullName || s._id} (${s.admissionNumber || 'N/A'}) does not belong to class ${classDoc.name} - Section ${classDoc.section}`
        );
      }
    }

    // Validate allowed status values
    const validStatuses = ['present', 'absent', 'late', 'half_day', 'holiday'];
    for (const r of uniqueRecords) {
      const st = (r.status || '').toLowerCase().trim();
      if (!validStatuses.includes(st)) {
        throw ApiError.badRequest(`Invalid attendance status '${r.status}'. Allowed: ${validStatuses.join(', ')}`);
      }
    }

    // Bulk upsert attendance records (one per student per date)
    const bulkOps = uniqueRecords.map((record) => ({
      updateOne: {
        filter: {
          student: new mongoose.Types.ObjectId(record.studentId),
          date: formattedDate,
        },
        update: {
          $set: {
            class: classDoc._id,
            status: record.status.toLowerCase().trim(),
            remarks: record.remarks || '',
            markedBy: markedBy && mongoose.Types.ObjectId.isValid(markedBy) ? new mongoose.Types.ObjectId(markedBy) : null,
          },
        },
        upsert: true,
      },
    }));

    const bulkResult = await Attendance.bulkWrite(bulkOps);

    // Calculate verified attendance metrics from confirmed unique records
    let present = 0;
    let absent = 0;
    let late = 0;
    let halfDay = 0;
    let holiday = 0;

    for (const r of uniqueRecords) {
      const st = r.status.toLowerCase().trim();
      if (st === 'present') present++;
      else if (st === 'absent') absent++;
      else if (st === 'late') late++;
      else if (st === 'half_day') halfDay++;
      else if (st === 'holiday') holiday++;
    }

    const total = uniqueRecords.length;
    const attendancePercentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

    return {
      date: formattedDate.toISOString().split('T')[0],
      classId: classDoc._id,
      className: `${classDoc.name} - Section ${classDoc.section}`,
      total,
      present,
      absent,
      late,
      halfDay,
      holiday,
      attendancePercentage,
      processedCount: total,
      upsertedCount: bulkResult.upsertedCount || 0,
      modifiedCount: bulkResult.modifiedCount || 0,
    };
  }

  /**
   * Get historical daily attendance logs for a specific class cohort
   */
  static async getClassAttendanceHistory(classId, limit = 30) {
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      throw ApiError.badRequest('Valid class ID is required');
    }

    const targetClassId = new mongoose.Types.ObjectId(classId);

    const history = await Attendance.aggregate([
      { $match: { class: targetClassId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          date: { $first: '$date' },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] },
          },
          halfDay: {
            $sum: { $cond: [{ $eq: ['$status', 'half_day'] }, 1, 0] },
          },
          holiday: {
            $sum: { $cond: [{ $eq: ['$status', 'holiday'] }, 1, 0] },
          },
          markedBy: { $first: '$markedBy' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: Math.max(1, Math.min(limit, 100)) },
      {
        $lookup: {
          from: 'users',
          localField: 'markedBy',
          foreignField: '_id',
          as: 'markedByUser',
        },
      },
      {
        $project: {
          id: '$_id',
          date: '$_id',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          halfDay: 1,
          holiday: 1,
          attendancePercentage: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] },
              0,
            ],
          },
          markedBy: {
            $ifNull: [{ $arrayElemAt: ['$markedByUser.name', 0] }, 'Faculty Incharge'],
          },
        },
      },
    ]);

    return history;
  }

  /**
   * Get attendance for a specific student across date range or month
   */
  static async getStudentAttendance(studentId, startDate, endDate) {
    let targetStudentId = studentId;
    if (studentId && !mongoose.Types.ObjectId.isValid(studentId)) {
      const studentDoc = await Student.findOne({ admissionNumber: String(studentId).toUpperCase() });
      if (studentDoc) {
        targetStudentId = studentDoc._id;
      }
    }

    const query = { student: targetStudentId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const records = await Attendance.find(query).sort({ date: -1 }).lean();

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const lateDays = records.filter((r) => r.status === 'late').length;
    const attendancePercentage = totalDays > 0 ? parseFloat(((presentDays / totalDays) * 100).toFixed(1)) : 100;

    return {
      studentId,
      summary: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage,
      },
      records,
    };
  }
}

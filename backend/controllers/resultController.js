import mongoose from 'mongoose';
import { Result } from '../models/Result.js';
import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getResults(req, res, next) {
  try {
    const { studentId, classId, term, academicYear = '2026-2027' } = req.query;
    const query = { academicYear };

    const role = req.user?.role;

    if (role === 'student') {
      if (!req.user.isLinked || !req.user.studentId) {
        throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
      }
      if (studentId && studentId !== 'me') {
        const isSelf =
          studentId.toString() === req.user.studentId.toString() ||
          (req.user.admissionNumber && studentId.toUpperCase() === req.user.admissionNumber.toUpperCase());
        if (!isSelf) {
          throw ApiError.forbidden('Forbidden: Students can only view their own examination results.');
        }
      }
      query.student = req.user.studentId;
    } else if (role === 'parent') {
      if (!req.user.isLinked || !Array.isArray(req.user.wardIds) || req.user.wardIds.length === 0) {
        throw ApiError.forbidden('Forbidden: Parent account is not linked to any official student record.');
      }
      const allowedWards = req.user.wardIds.map((id) => id.toString());
      if (studentId && studentId !== 'me') {
        let targetStudentId = studentId;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          const studentDoc = await Student.findOne({
            _id: { $in: allowedWards },
            admissionNumber: String(studentId).toUpperCase(),
          }).select('_id').lean();
          if (studentDoc) targetStudentId = studentDoc._id.toString();
        }
        if (!allowedWards.includes(targetStudentId.toString())) {
          throw ApiError.forbidden('Forbidden: Parents can only access examination results for their linked children.');
        }
        query.student = targetStudentId;
      } else {
        query.student = { $in: allowedWards };
      }
    } else if (role === 'teacher' && req.user.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (classId) {
        if (!assignedClasses.includes(classId.toString())) {
          throw ApiError.forbidden('Forbidden: Teachers can only access results for their assigned classes.');
        }
        query.class = classId;
      } else if (studentId) {
        let targetStudentId = studentId;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          const studentDoc = await Student.findOne({ admissionNumber: String(studentId).toUpperCase() });
          if (studentDoc) targetStudentId = studentDoc._id;
        }
        const student = await Student.findById(targetStudentId).select('class').lean();
        if (!student) {
          throw ApiError.notFound('Student record not found');
        }
        const studentClassId = student.class ? student.class.toString() : null;
        if (!studentClassId || !assignedClasses.includes(studentClassId)) {
          throw ApiError.forbidden('Forbidden: Teachers can only access results for students in their assigned classes.');
        }
        query.student = targetStudentId;
      } else {
        query.class = { $in: assignedClasses };
      }
    } else {
      // Admin / Staff
      if (studentId) {
        let targetStudentId = studentId;
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
          const studentDoc = await Student.findOne({ admissionNumber: String(studentId).toUpperCase() });
          if (studentDoc) targetStudentId = studentDoc._id;
        }
        query.student = targetStudentId;
      }
      if (classId) query.class = classId;
    }

    if (term) query.term = term;

    const results = await Result.find(query)
      .populate('student', 'fullName admissionNumber rollNumber')
      .populate('class', 'name section')
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.success(res, results, 'Examination results retrieved');
  } catch (error) {
    next(error);
  }
}

export async function publishResult(req, res, next) {
  try {
    const { studentId, classId, term, academicYear = '2026-2027', subjects, teacherRemarks } = req.body;

    if (!studentId || !classId) {
      throw ApiError.badRequest('Student ID and Class ID are required to publish results.');
    }

    // Role check for teachers:
    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (assignedClasses.length === 0 || !assignedClasses.includes(classId.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to publish results for their assigned classes.');
      }

      // Check student belongs to assigned class
      let targetStudentId = studentId;
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        const studentDoc = await Student.findOne({ admissionNumber: String(studentId).toUpperCase() });
        if (studentDoc) targetStudentId = studentDoc._id;
      }
      const student = await Student.findById(targetStudentId).select('class').lean();
      if (!student) {
        throw ApiError.notFound('Student record not found');
      }
      const studentClassId = student.class ? student.class.toString() : null;
      if (!studentClassId || !assignedClasses.includes(studentClassId)) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to publish results for students in their assigned classes.');
      }
    }

    // Upsert result for the student in that term
    const result = await Result.findOneAndUpdate(
      { student: studentId, term, academicYear },
      {
        student: studentId,
        class: classId,
        term,
        academicYear,
        subjects,
        teacherRemarks,
        publishedBy: req.user?.id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return ApiResponse.success(res, result, 'Student report card saved successfully');
  } catch (error) {
    next(error);
  }
}

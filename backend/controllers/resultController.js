import { Result } from '../models/Result.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getResults(req, res, next) {
  try {
    const { studentId, classId, term, academicYear = '2026-2027' } = req.query;
    const query = { academicYear };

    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (term) query.term = term;

    const results = await Result.find(query)
      .populate('student', 'fullName admissionNumber rollNumber')
      .populate('class', 'name section')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, results, 'Examination results retrieved');
  } catch (error) {
    next(error);
  }
}

export async function publishResult(req, res, next) {
  try {
    const { studentId, classId, term, academicYear = '2026-2027', subjects, teacherRemarks } = req.body;

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

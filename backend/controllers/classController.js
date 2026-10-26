import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getClasses(req, res, next) {
  try {
    const { academicYear = '2026-2027', status = 'active' } = req.query;
    const classes = await Class.find({ academicYear, status })
      .populate('classTeacher', 'fullName employeeId wing email')
      .sort({ name: 1, section: 1 });

    return ApiResponse.success(res, classes, 'Classes retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getClassById(req, res, next) {
  try {
    const classDoc = await Class.findById(req.params.id).populate('classTeacher', 'fullName email phone');
    if (!classDoc) {
      throw ApiError.notFound('Class not found');
    }

    // Also get enrolled students count
    const studentCount = await Student.countDocuments({ class: classDoc._id, status: 'active' });

    return ApiResponse.success(res, { ...classDoc.toObject(), studentCount }, 'Class details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createClass(req, res, next) {
  try {
    const newClass = await Class.create(req.body);
    return ApiResponse.created(res, newClass, 'Class created successfully');
  } catch (error) {
    next(error);
  }
}

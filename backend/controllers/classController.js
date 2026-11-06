import mongoose from 'mongoose';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { sanitizePublicClass, sanitizeEnumQuery } from '../utils/privacySanitizer.js';

export async function getClasses(req, res, next) {
  try {
    const { academicYear, status } = req.query;
    const query = {};

    const cleanYear = typeof academicYear === 'string' ? academicYear.trim() : '2026-2027';
    if (cleanYear && cleanYear.toLowerCase() !== 'all') {
      query.academicYear = cleanYear;
    }

    const cleanStatus = sanitizeEnumQuery(status, ['active', 'inactive', 'archived', 'all'], 'active');
    if (cleanStatus && cleanStatus !== 'all') {
      query.status = cleanStatus;
    }

    const rawClasses = await Class.find(query)
      .populate('classTeacher', 'fullName wing designation')
      .sort({ name: 1, section: 1 })
      .lean();

    const classes = rawClasses.map(sanitizePublicClass);
    return ApiResponse.success(res, classes, 'Classes retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getClassById(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw ApiError.badRequest('Invalid class identifier format');
    }

    const classDoc = await Class.findById(req.params.id)
      .populate('classTeacher', 'fullName wing designation')
      .lean();
    if (!classDoc) {
      throw ApiError.notFound('Class not found');
    }

    // Also get enrolled students count
    const studentCount = await Student.countDocuments({ class: classDoc._id, status: 'active' });

    return ApiResponse.success(
      res,
      sanitizePublicClass({ ...classDoc, studentCount }),
      'Class details retrieved'
    );
  } catch (error) {
    next(error);
  }
}

export async function createClass(req, res, next) {
  try {
    const classData = { ...req.body };
    if (!classData.roomNumber && classData.room) {
      classData.roomNumber = classData.room;
    }

    if (classData.classTeacher && !mongoose.Types.ObjectId.isValid(classData.classTeacher)) {
      const teacher = await Teacher.findOne({
        $or: [
          { fullName: classData.classTeacher },
          { employeeId: classData.classTeacher },
        ],
      });
      if (teacher) {
        classData.classTeacher = teacher._id;
      } else {
        delete classData.classTeacher;
      }
    }

    const newClass = await Class.create(classData);
    const populated = await Class.findById(newClass._id).populate('classTeacher', 'fullName employeeId');
    return ApiResponse.created(res, populated, 'Class created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateClass(req, res, next) {
  try {
    if (req.user?.role !== 'admin') {
      throw ApiError.forbidden('Administrative authorization is required to modify class cohorts.');
    }

    const classData = { ...req.body };
    if (!classData.roomNumber && classData.room) {
      classData.roomNumber = classData.room;
    }

    if (classData.classTeacher && !mongoose.Types.ObjectId.isValid(classData.classTeacher)) {
      const teacher = await Teacher.findOne({
        $or: [
          { fullName: classData.classTeacher },
          { employeeId: classData.classTeacher },
        ],
      });
      if (teacher) {
        classData.classTeacher = teacher._id;
      } else {
        delete classData.classTeacher;
      }
    }

    const updated = await Class.findByIdAndUpdate(req.params.id, classData, {
      new: true,
      runValidators: true,
    }).populate('classTeacher', 'fullName employeeId wing email');

    if (!updated) {
      throw ApiError.notFound('Class cohort not found');
    }

    return ApiResponse.success(res, updated, 'Class details updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteClass(req, res, next) {
  try {
    if (req.user?.role !== 'admin') {
      throw ApiError.forbidden('Administrative authorization is required to delete class cohorts.');
    }

    const classId = req.params.id;
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      throw ApiError.badRequest('Invalid class ID provided');
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      throw ApiError.notFound('Class cohort not found');
    }

    const enrolled = await Student.countDocuments({ class: classId });
    if (enrolled > 0) {
      throw ApiError.conflict(
        `Cannot delete class '${classDoc.name}-${classDoc.section}'. ${enrolled} active student(s) are currently enrolled. Please reassign students first.`
      );
    }

    await Class.findByIdAndDelete(classId);
    return ApiResponse.success(res, null, 'Class cohort deleted successfully');
  } catch (error) {
    next(error);
  }
}

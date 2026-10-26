import { Student } from '../models/Student.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getStudents(req, res, next) {
  try {
    const { classId, section, status = 'active', search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (classId) query.class = classId;
    if (section) query.section = section;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Student.find(query)
        .sort({ admissionNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('class', 'name section')
        .populate('parent', 'primaryContact fatherName motherName'),
      Student.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Students fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const isMe = req.params.id === 'me';
    const student = isMe
      ? await Student.findOne({ user: req.user.id })
          .populate('class')
          .populate('parent')
          .populate('user', 'email role lastLogin')
      : await Student.findById(req.params.id)
          .populate('class')
          .populate('parent')
          .populate('user', 'email role lastLogin');

    if (!student) {
      throw ApiError.notFound('Student not found');
    }

    return ApiResponse.success(res, student, 'Student details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const student = await Student.create(req.body);
    return ApiResponse.created(res, student, 'Student enrolled successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      throw ApiError.notFound('Student not found');
    }
    return ApiResponse.success(res, student, 'Student details updated');
  } catch (error) {
    next(error);
  }
}

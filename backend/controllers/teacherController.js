import { Teacher } from '../models/Teacher.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getTeachers(req, res, next) {
  try {
    const { wing, status = 'active' } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (wing && wing !== 'All' && wing !== 'all') query.wing = wing;

    const teachers = await Teacher.find(query)
      .populate('assignedClasses', 'name section')
      .populate('user', 'email avatar')
      .sort({ wing: 1, fullName: 1 });

    return ApiResponse.success(res, teachers, 'Faculty list retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getTeacherById(req, res, next) {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedClasses')
      .populate('user', 'email avatar lastLogin');

    if (!teacher) {
      throw ApiError.notFound('Teacher record not found');
    }

    return ApiResponse.success(res, teacher, 'Teacher details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createTeacher(req, res, next) {
  try {
    const teacher = await Teacher.create(req.body);
    return ApiResponse.created(res, teacher, 'Teacher registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateTeacher(req, res, next) {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!teacher) {
      throw ApiError.notFound('Teacher record not found');
    }
    return ApiResponse.success(res, teacher, 'Teacher details updated');
  } catch (error) {
    next(error);
  }
}

import mongoose from 'mongoose';
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
      .sort({ wing: 1, fullName: 1 })
      .lean();

    return ApiResponse.success(res, teachers, 'Faculty list retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getTeacherById(req, res, next) {
  try {
    const isMe = req.params.id === 'me';
    let teacher;

    if (isMe) {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required to view your profile');
      }
      teacher = await Teacher.findOne({ user: req.user.id })
        .populate('assignedClasses')
        .populate('user', 'email avatar lastLogin')
        .lean();
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { employeeId: req.params.id };
      teacher = await Teacher.findOne(query)
        .populate('assignedClasses')
        .populate('user', 'email avatar lastLogin')
        .lean();
    }

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
    const isMe = req.params.id === 'me';
    let query;

    if (isMe) {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      query = { user: req.user.id };
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      query = isObjectId ? { _id: req.params.id } : { employeeId: req.params.id };
    }

    const existingTeacher = await Teacher.findOne(query);
    if (!existingTeacher) {
      throw ApiError.notFound('Teacher record not found');
    }

    let updateFields = {};

    if (req.user?.role === 'teacher') {
      // Teachers can only update permitted personal particulars
      const isOwnProfile =
        isMe ||
        (existingTeacher.user && existingTeacher.user.toString() === req.user.id.toString()) ||
        existingTeacher.employeeId === req.user.employeeId;

      if (!isOwnProfile) {
        throw ApiError.forbidden('Teachers are only permitted to update their own profile');
      }

      const { phone, bio, qualification, photoUrl, experienceYears } = req.body;
      if (phone) updateFields.phone = phone;
      if (bio !== undefined) updateFields.bio = bio;
      if (qualification) updateFields.qualification = qualification;
      if (photoUrl !== undefined) updateFields.photoUrl = photoUrl;
      if (experienceYears !== undefined) updateFields.experienceYears = experienceYears;
    } else {
      // Administrators can update all teacher particulars
      updateFields = { ...req.body };
      delete updateFields._id;
    }

    const teacher = await Teacher.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('assignedClasses')
      .populate('user', 'email avatar lastLogin');

    return ApiResponse.success(res, teacher, 'Teacher details updated successfully');
  } catch (error) {
    next(error);
  }
}

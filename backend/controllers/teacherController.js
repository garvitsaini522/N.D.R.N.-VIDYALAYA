import crypto from 'crypto';
import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.js';
import { User } from '../models/User.js';
import { Class } from '../models/Class.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import {
  sanitizePublicTeacher,
  sanitizeEnumQuery,
} from '../utils/privacySanitizer.js';

export async function getTeachers(req, res, next) {
  try {
    const { wing, status } = req.query;
    const query = {};

    const sanitizedStatus = sanitizeEnumQuery(status, ['active', 'on_leave', 'resigned', 'all'], 'active');
    if (sanitizedStatus && sanitizedStatus !== 'all') {
      query.status = sanitizedStatus;
    }

    const sanitizedWing = sanitizeEnumQuery(
      wing,
      ['Pre-Primary', 'Primary', 'Activities', 'Administration', 'all', 'All'],
      null
    );
    if (sanitizedWing && sanitizedWing.toLowerCase() !== 'all') {
      query.wing = sanitizedWing;
    }

    const isAdmin = req.user?.role === 'admin';

    // Defense-in-depth projection: non-admin queries do not pull phone, email, employeeId, or user
    const projection = isAdmin ? '' : '-phone -email -user -employeeId -__v';

    const teachers = await Teacher.find(query, projection)
      .populate('assignedClasses', 'name section')
      .sort({ wing: 1, fullName: 1 })
      .lean();

    if (!isAdmin) {
      const publicList = teachers.map(sanitizePublicTeacher);
      return ApiResponse.success(res, publicList, 'Faculty list retrieved');
    }

    // For admin: populate user details needed for teacher management
    const adminPopulated = await Teacher.populate(teachers, {
      path: 'user',
      select: 'email avatar lastLogin status role',
    });

    return ApiResponse.success(res, adminPopulated, 'Faculty list retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getTeacherById(req, res, next) {
  try {
    const { id } = req.params;
    const isMe = id === 'me';
    const isAdmin = req.user?.role === 'admin';

    if (isMe) {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required to view your profile');
      }
      if (req.user.role !== 'teacher' && !isAdmin) {
        throw ApiError.forbidden('Forbidden: Only educators can access this profile endpoint.');
      }
      const teacher = await Teacher.findOne({ user: req.user.id })
        .populate('assignedClasses')
        .populate('user', 'email avatar lastLogin')
        .lean();

      if (!teacher) {
        throw ApiError.notFound('Teacher profile not found.');
      }
      return ApiResponse.success(res, teacher, 'Teacher details retrieved');
    }

    // Validate ID format
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const isEmployeeId = /^EMP-\d{4}-\d{3,5}$/i.test(id);

    if (!isObjectId && !isEmployeeId) {
      throw ApiError.badRequest('Invalid teacher identifier format.');
    }

    const query = isObjectId ? { _id: id } : { employeeId: id.toUpperCase() };

    if (!isAdmin) {
      const teacher = await Teacher.findOne(query)
        .populate('assignedClasses', 'name section')
        .select('-phone -email -user -employeeId -__v')
        .lean();

      if (!teacher) {
        throw ApiError.notFound('Teacher record not found');
      }

      return ApiResponse.success(res, sanitizePublicTeacher(teacher), 'Teacher details retrieved');
    }

    const teacher = await Teacher.findOne(query)
      .populate('assignedClasses')
      .populate('user', 'email avatar lastLogin')
      .lean();

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
    const teacherData = { ...req.body };

    // Format full name if passed as name
    if (!teacherData.fullName && teacherData.name) {
      teacherData.fullName = teacherData.name;
    }

    // Parse experienceYears if passed as string e.g. "3 Years"
    if (teacherData.experienceYears === undefined && teacherData.experience) {
      const match = String(teacherData.experience).match(/\d+/);
      teacherData.experienceYears = match ? parseInt(match[0], 10) : 0;
    }

    // Auto-generate employeeId if not provided
    if (!teacherData.employeeId) {
      const count = await Teacher.countDocuments();
      teacherData.employeeId = `EMP-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }

    // Ensure User document exists for teacher
    if (!teacherData.user) {
      const teacherEmail = teacherData.email || `${teacherData.employeeId.toLowerCase()}@ndrn.edu`;
      let user = await User.findOne({ email: teacherEmail });
      if (!user) {
        user = await User.create({
          name: teacherData.fullName,
          email: teacherEmail,
          password: crypto.randomBytes(8).toString('hex') + 'Aa1!',
          role: 'teacher',
          phone: teacherData.phone || '',
        });
      }
      teacherData.user = user._id;
    }

    const teacher = await Teacher.create(teacherData);
    const populated = await Teacher.findById(teacher._id)
      .populate('assignedClasses', 'name section')
      .populate('user', 'email avatar lastLogin');

    return ApiResponse.created(res, populated, 'Teacher registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteTeacher(req, res, next) {
  try {
    if (req.user?.role !== 'admin') {
      throw ApiError.forbidden('Administrative authorization is required to delete teacher records.');
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { employeeId: req.params.id };

    const teacher = await Teacher.findOne(query);
    if (!teacher) {
      throw ApiError.notFound('Teacher record not found');
    }

    // Unassign this teacher from any classes where they were designated as class teacher
    await Class.updateMany({ classTeacher: teacher._id }, { $unset: { classTeacher: 1 } });

    await Teacher.findByIdAndDelete(teacher._id);
    return ApiResponse.success(res, null, 'Teacher record deleted successfully');
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

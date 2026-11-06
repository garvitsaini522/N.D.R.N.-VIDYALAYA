import mongoose from 'mongoose';
import { Parent } from '../models/Parent.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { AccountLinkingService } from '../services/accountLinkingService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getParents(req, res, next) {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { 'primaryContact.name': { $regex: search, $options: 'i' } },
        { 'primaryContact.phone': { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { motherName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Parent.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('students', 'fullName admissionNumber class section')
        .lean(),
      Parent.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Parents retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getParentById(req, res, next) {
  try {
    const isMe = req.params.id === 'me';
    let parent;

    if (isMe) {
      if (req.user.role === 'parent' && req.user.parentId) {
        parent = await Parent.findById(req.user.parentId)
          .populate('students')
          .populate('user', 'email role lastLogin')
          .lean();
      } else {
        parent = await Parent.findOne({ user: req.user.id })
          .populate('students')
          .populate('user', 'email role lastLogin')
          .lean();
      }
    } else {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw ApiError.badRequest('Invalid parent ID provided');
      }
      parent = await Parent.findById(req.params.id)
        .populate('students')
        .populate('user', 'email role lastLogin')
        .lean();
    }

    if (!parent) {
      throw ApiError.notFound('Parent record not found');
    }

    // Role-based authorization: admin, staff, or owning parent
    const parentUserId = parent.user?._id ? parent.user._id.toString() : parent.user ? parent.user.toString() : null;
    const isOwner =
      req.user.role === 'parent' &&
      req.user.isLinked &&
      (parentUserId === req.user.id.toString() ||
        (req.user.parentId && parent._id.toString() === req.user.parentId.toString()));
    const isStaffOrAdmin = ['admin', 'staff'].includes(req.user.role);

    if (!isStaffOrAdmin && !isOwner) {
      throw ApiError.forbidden('Forbidden: You are not authorized to view this parent record.');
    }

    return ApiResponse.success(res, parent, 'Parent details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateParent(req, res, next) {
  try {
    const targetId = req.params.id === 'me' ? req.user.parentId : req.params.id;
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      throw ApiError.badRequest('Invalid parent ID provided');
    }

    const parent = await Parent.findById(targetId);
    if (!parent) {
      throw ApiError.notFound('Parent record not found');
    }

    // Authorization: Admin or owning verified parent only
    const isOwner =
      req.user.role === 'parent' &&
      (parent.user?.toString() === req.user.id ||
        parent._id.toString() === req.user.parentId);
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      throw ApiError.forbidden('Forbidden: You are not authorized to update this parent record.');
    }

    let updateFields = {};

    if (isOwner && !isAdmin) {
      // Whitelist permitted editable fields for parents
      const {
        primaryContact,
        phone,
        email,
        address,
        occupation,
        fatherName,
        motherName,
        annualIncome,
      } = req.body;

      if (fatherName) updateFields.fatherName = fatherName;
      if (motherName) updateFields.motherName = motherName;
      if (occupation) updateFields.occupation = occupation;
      if (annualIncome !== undefined) updateFields.annualIncome = annualIncome;

      if (primaryContact && typeof primaryContact === 'object') {
        updateFields.primaryContact = {
          ...(parent.primaryContact?.toObject?.() || parent.primaryContact || {}),
          ...primaryContact,
        };
      }
      if (phone) {
        if (!updateFields.primaryContact) {
          updateFields.primaryContact = {
            ...(parent.primaryContact?.toObject?.() || parent.primaryContact || {}),
          };
        }
        updateFields.primaryContact.phone = phone;
      }
      if (email) {
        if (!updateFields.primaryContact) {
          updateFields.primaryContact = {
            ...(parent.primaryContact?.toObject?.() || parent.primaryContact || {}),
          };
        }
        updateFields.primaryContact.email = email;
      }
      if (address !== undefined) {
        updateFields.address = address;
      }
    } else {
      // Admin update: allow general profile update while protecting sensitive system fields
      updateFields = { ...req.body };
      delete updateFields._id;
      delete updateFields.linkingCode;
      delete updateFields.linkingCodeExpires;
    }

    const updatedParent = await Parent.findByIdAndUpdate(
      targetId,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('students')
      .populate('user', 'email role lastLogin');

    return ApiResponse.success(res, updatedParent, 'Parent profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function createParent(req, res, next) {
  try {
    const parentData = { ...req.body };

    // Format primaryContact if flattened form fields were supplied
    if (!parentData.primaryContact && (parentData.name || parentData.phone)) {
      parentData.primaryContact = {
        name: parentData.name || parentData.primaryContactName || 'Parent / Guardian',
        phone: parentData.phone || parentData.primaryContactPhone,
        email: parentData.email || undefined,
        relationship: parentData.relationship || 'Father',
      };
    }

    if (!parentData.fatherName && parentData.relationship === 'Father') {
      parentData.fatherName = parentData.name;
    }
    if (!parentData.motherName && parentData.relationship === 'Mother') {
      parentData.motherName = parentData.name;
    }
    if (parentData.spouseName) {
      if (parentData.relationship === 'Father' && !parentData.motherName) {
        parentData.motherName = parentData.spouseName;
      } else if (parentData.relationship === 'Mother' && !parentData.fatherName) {
        parentData.fatherName = parentData.spouseName;
      }
    }

    const parent = await Parent.create(parentData);

    // If wardId was specified, link student to parent
    if (parentData.wardId) {
      const studentQuery = mongoose.Types.ObjectId.isValid(parentData.wardId)
        ? { _id: parentData.wardId }
        : { admissionNumber: String(parentData.wardId).toUpperCase() };
      const student = await Student.findOne(studentQuery);
      if (student) {
        parent.students = [student._id];
        await parent.save();
        student.parent = parent._id;
        await student.save();
      }
    }

    const populatedParent = await Parent.findById(parent._id).populate('students');
    return ApiResponse.created(res, populatedParent, 'Parent registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteParent(req, res, next) {
  try {
    if (req.user?.role !== 'admin') {
      throw ApiError.forbidden('Administrative authorization is required to delete parent records.');
    }

    const targetId = req.params.id;
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      throw ApiError.badRequest('Invalid parent ID provided.');
    }

    const parent = await Parent.findById(targetId);
    if (!parent) {
      throw ApiError.notFound('Parent record not found.');
    }

    // Unlink any students associated with this parent
    await Student.updateMany({ parent: targetId }, { $unset: { parent: 1 } });

    // Unlink any user accounts associated with this parent
    if (parent.user) {
      await User.findByIdAndUpdate(parent.user, {
        $unset: { parent: 1, parentId: 1, wardIds: 1 },
        $set: { isLinked: false },
      });
    }

    await Parent.findByIdAndDelete(targetId);
    return ApiResponse.success(res, null, 'Parent record deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function linkParentWard(req, res, next) {
  try {
    const parentId = req.params.id;
    const { studentId, admissionNumber } = req.body;
    const result = await AccountLinkingService.linkParentWard(
      { parentId, studentId, admissionNumber },
      req.user
    );
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function unlinkParentWard(req, res, next) {
  try {
    const parentId = req.params.id;
    const studentId = req.params.studentId || req.body.studentId;
    const result = await AccountLinkingService.unlinkParentWard(
      { parentId, studentId },
      req.user
    );
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

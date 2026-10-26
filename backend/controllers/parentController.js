import { Parent } from '../models/Parent.js';
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
        .populate('students', 'fullName admissionNumber class section'),
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
    const parent = isMe
      ? await Parent.findOne({ user: req.user.id })
          .populate('students')
          .populate('user', 'email role lastLogin')
      : await Parent.findById(req.params.id)
          .populate('students')
          .populate('user', 'email role lastLogin');

    if (!parent) {
      throw ApiError.notFound('Parent record not found');
    }

    // Role-based authorization: admin, teacher, staff, or owning parent
    const isOwner =
      req.user.role === 'parent' &&
      (parent.user?._id?.toString() === req.user.id ||
        parent.user?.toString() === req.user.id ||
        parent._id.toString() === req.user.parentId);
    const isStaffOrAdmin = ['admin', 'teacher', 'staff'].includes(req.user.role);

    if (!isStaffOrAdmin && !isOwner) {
      return ApiResponse.error(
        res,
        'Forbidden: You are not authorized to view this parent record.',
        403
      );
    }

    return ApiResponse.success(res, parent, 'Parent details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createParent(req, res, next) {
  try {
    const parent = await Parent.create(req.body);
    return ApiResponse.created(res, parent, 'Parent registered successfully');
  } catch (error) {
    next(error);
  }
}

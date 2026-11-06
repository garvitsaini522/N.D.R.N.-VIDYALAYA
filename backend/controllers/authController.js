import { AuthService } from '../services/authService.js';
import { AccountLinkingService } from '../services/accountLinkingService.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Teacher } from '../models/Teacher.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function login(req, res, next) {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = identifier || email;

    const result = await AuthService.login(loginIdentifier, password);
    return ApiResponse.success(res, result, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      isLinked: false,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    if (user.role === 'student') {
      let student = await Student.findOne({ user: user._id })
        .populate('class', 'name section')
        .populate('parent', 'primaryContact fatherName motherName')
        .lean();

      if (!student && user.student) {
        const candidate = await Student.findById(user.student)
          .populate('class', 'name section')
          .populate('parent', 'primaryContact fatherName motherName')
          .lean();

        if (candidate && (!candidate.user || candidate.user.toString() === user._id.toString())) {
          student = candidate;
        }
      }

      if (student) {
        responseData.isLinked = true;
        responseData.studentId = student._id;
        responseData.admissionNumber = student.admissionNumber;
        responseData.studentProfile = {
          id: student._id,
          _id: student._id,
          name: student.fullName,
          fullName: student.fullName,
          admissionNo: student.admissionNumber,
          admissionNumber: student.admissionNumber,
          rollNo: student.rollNumber,
          rollNumber: student.rollNumber,
          grade: student.class?.name || 'Primary Wing',
          section: student.section,
          academicYear: student.academicYear,
          dateOfBirth: student.dateOfBirth,
          gender: student.gender,
          bloodGroup: student.bloodGroup,
          address: student.address,
          emergencyContact: student.emergencyContact,
          parent: student.parent,
        };
      }
    } else if (user.role === 'parent') {
      let parent = await Parent.findOne({ user: user._id })
        .populate({
          path: 'students',
          populate: { path: 'class', select: 'name section' },
        })
        .lean();

      if (!parent && user.parent) {
        const candidate = await Parent.findById(user.parent)
          .populate({
            path: 'students',
            populate: { path: 'class', select: 'name section' },
          })
          .lean();

        if (candidate && (!candidate.user || candidate.user.toString() === user._id.toString())) {
          parent = candidate;
        }
      }

      if (parent) {
        const wards = (parent.students || []).filter(Boolean).map((s) => ({
          id: s._id,
          _id: s._id,
          name: s.fullName,
          fullName: s.fullName,
          admissionNo: s.admissionNumber,
          admissionNumber: s.admissionNumber,
          rollNo: s.rollNumber,
          rollNumber: s.rollNumber,
          grade: s.class?.name || 'Primary Wing',
          section: s.section,
          academicYear: s.academicYear,
          dateOfBirth: s.dateOfBirth,
          gender: s.gender,
          bloodGroup: s.bloodGroup,
          address: s.address,
          emergencyContact: s.emergencyContact,
        }));

        const wardIds = wards.map((w) => w.id.toString());
        const hasWards = wardIds.length > 0;

        responseData.isLinked = hasWards;
        responseData.parentId = parent._id;
        responseData.wards = wards;
        responseData.wardIds = wardIds;
        responseData.ward = wards[0] || null;
        responseData.wardId = wards[0]?.id || null;
        responseData.parentProfile = parent;
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id })
        .populate('assignedClasses', 'name section')
        .lean();

      if (teacher) {
        responseData.isLinked = true;
        responseData.teacherId = teacher._id;
        responseData.employeeId = teacher.employeeId;
        responseData.teacherProfile = teacher;
      }
    } else if (user.role === 'admin') {
      responseData.isLinked = true;
    }

    return ApiResponse.success(res, responseData, 'Current user profile retrieved');
  } catch (error) {
    next(error);
  }
}

export async function register(req, res, next) {
  try {
    const setupKey = req.headers['x-admin-setup-key'] || req.body.adminSetupKey;
    const requester = req.user; // If authenticated admin is creating account

    const newUser = await AuthService.createUser(req.body, requester, setupKey);
    return ApiResponse.created(res, newUser, 'User account registered successfully');
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { tokenInvalidatedAt: new Date() });
    }
    return ApiResponse.success(res, null, 'Logged out successfully. Token session revoked.');
  } catch (error) {
    next(error);
  }
}

/**
 * Self-service: Authenticated student or parent links account using admin-issued code
 */
export async function linkAccount(req, res, next) {
  try {
    const result = await AccountLinkingService.redeemLinkingCode(req.user, req.body);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Link a student user to a student record
 */
export async function adminLinkStudent(req, res, next) {
  try {
    const result = await AccountLinkingService.linkStudentAccount(req.body, req.user);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Unlink a student user from a student record
 */
export async function adminUnlinkStudent(req, res, next) {
  try {
    const result = await AccountLinkingService.unlinkStudentAccount(req.body, req.user);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Link a parent user to a parent record
 */
export async function adminLinkParent(req, res, next) {
  try {
    const result = await AccountLinkingService.linkParentAccount(req.body, req.user);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Unlink a parent user from a parent record
 */
export async function adminUnlinkParent(req, res, next) {
  try {
    const result = await AccountLinkingService.unlinkParentAccount(req.body, req.user);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Link a student ward to a parent record
 */
export async function adminLinkWard(req, res, next) {
  try {
    const result = await AccountLinkingService.linkParentWard(req.body, req.user);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Unlink a student ward from a parent record
 */
export async function adminUnlinkWard(req, res, next) {
  try {
    const result = await AccountLinkingService.unlinkParentWard(req.body, req.user);
    return ApiResponse.success(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Generate a temporary linking code
 */
export async function adminGenerateLinkCode(req, res, next) {
  try {
    const result = await AccountLinkingService.generateLinkingCode(req.body, req.user);
    return ApiResponse.created(res, result, 'Linking code generated successfully.');
  } catch (error) {
    next(error);
  }
}

/**
 * Administrative: Get list of unlinked student/parent users
 */
export async function adminGetUnlinkedUsers(req, res, next) {
  try {
    const result = await AccountLinkingService.getUnlinkedAccounts(req.user);
    return ApiResponse.success(res, result, 'Unlinked accounts retrieved.');
  } catch (error) {
    next(error);
  }
}

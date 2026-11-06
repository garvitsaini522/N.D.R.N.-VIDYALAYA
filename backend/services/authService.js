import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Teacher } from '../models/Teacher.js';
import { AccountLinkingService } from './accountLinkingService.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

export class AuthService {
  /**
   * Generate signed JWT token
   * Minimal and secure: contains identity and verified link pointers.
   */
  static generateToken(user, context = {}) {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      isLinked: Boolean(context.isLinked),
    };

    if (context.studentId) {
      payload.studentId = context.studentId.toString();
    }
    if (context.parentId) {
      payload.parentId = context.parentId.toString();
    }
    if (Array.isArray(context.wardIds) && context.wardIds.length > 0) {
      payload.wardIds = context.wardIds.map((id) => id.toString());
    }

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Authenticate user credentials (email, phone, or institutional ID)
   */
  static async login(identifier, password) {
    if (!identifier || !password) {
      throw ApiError.badRequest('Identifier (email/phone) and password are required');
    }

    const trimmed = identifier.trim();
    let query = trimmed.includes('@')
      ? { email: trimmed.toLowerCase() }
      : { $or: [{ email: trimmed.toLowerCase() }, { phone: trimmed }] };

    let user = await User.findOne(query).select('+password');

    // If not found by email or phone, check institutional IDs (Admission number or Employee ID)
    if (!user) {
      const studentMatch = await Student.findOne({ admissionNumber: trimmed.toUpperCase() });
      if (studentMatch?.user) {
        user = await User.findById(studentMatch.user).select('+password');
      } else {
        const teacherMatch = await Teacher.findOne({ employeeId: trimmed.toUpperCase() });
        if (teacherMatch?.user) {
          user = await User.findById(teacherMatch.user).select('+password');
        }
      }
    }

    if (!user) {
      throw ApiError.unauthorized('Invalid email/identifier or password');
    }

    if (user.status !== 'active') {
      throw ApiError.forbidden(`Your account is currently ${user.status}. Please contact the school administration.`);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email/identifier or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Discover verified MongoDB linked records
    const context = { isLinked: false };
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isLinked: false,
    };

    if (user.role === 'student') {
      let student = await Student.findOne({ user: user._id })
        .populate('class', 'name section')
        .populate('parent', 'primaryContact fatherName motherName')
        .lean();

      // Check user.student reference and enforce bidirectional integrity
      if (!student && user.student) {
        const candidate = await Student.findById(user.student)
          .populate('class', 'name section')
          .populate('parent', 'primaryContact fatherName motherName')
          .lean();

        if (candidate && (!candidate.user || candidate.user.toString() === user._id.toString())) {
          student = candidate;
          if (!candidate.user) {
            await Student.findByIdAndUpdate(candidate._id, { user: user._id });
          }
        } else {
          // Invalid or stolen link: clear invalid pointer from User
          await User.findByIdAndUpdate(user._id, { student: null, isLinked: false });
        }
      } else if (student && (!user.student || user.student.toString() !== student._id.toString() || !user.isLinked)) {
        await User.findByIdAndUpdate(user._id, { student: student._id, isLinked: true });
      }

      if (student) {
        context.isLinked = true;
        context.studentId = student._id;
        userProfile.isLinked = true;
        userProfile.studentId = student._id;
        userProfile.admissionNumber = student.admissionNumber;
        userProfile.studentProfile = {
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
          if (!candidate.user) {
            await Parent.findByIdAndUpdate(candidate._id, { user: user._id });
          }
        } else {
          await User.findByIdAndUpdate(user._id, { parent: null, isLinked: false });
        }
      } else if (parent && (!user.parent || user.parent.toString() !== parent._id.toString())) {
        await User.findByIdAndUpdate(user._id, { parent: parent._id, isLinked: (parent.students || []).length > 0 });
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

        context.isLinked = hasWards;
        context.parentId = parent._id;
        context.wardIds = wardIds;

        userProfile.isLinked = hasWards;
        userProfile.parentId = parent._id;
        userProfile.wards = wards;
        userProfile.wardIds = wardIds;
        userProfile.ward = wards[0] || null;
        userProfile.wardId = wards[0]?.id || null;
        userProfile.parentProfile = parent;
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id })
        .populate('assignedClasses', 'name section')
        .lean();

      if (teacher) {
        context.isLinked = true;
        userProfile.isLinked = true;
        userProfile.teacherId = teacher._id;
        userProfile.employeeId = teacher.employeeId;
        userProfile.teacherProfile = teacher;
      }
    } else if (user.role === 'admin') {
      context.isLinked = true;
      userProfile.isLinked = true;
    }

    const token = this.generateToken(user, context);

    return {
      token,
      user: userProfile,
    };
  }

  /**
   * Create a new user with role-based restriction enforcement.
   * Public registration creates User records without automatically linking to Student/Parent records.
   * Linking must happen through administrator provisioning or an administrator-issued linkingCode.
   */
  static async createUser(userData, requester = null, setupKey = null) {
    const requestedRole = (userData.role || 'student').toLowerCase();

    // Enforce controlled provisioning for ADMIN
    if (requestedRole === 'admin') {
      const isAuthorizedAdmin = requester && requester.role === 'admin';
      const hasValidBootstrapKey = setupKey && setupKey === config.adminSetupKey;

      if (!isAuthorizedAdmin && !hasValidBootstrapKey) {
        throw ApiError.forbidden(
          'Public registration for administrator accounts is not permitted. Admin accounts must be created through a secure controlled process.'
        );
      }
    }

    // Enforce controlled provisioning for TEACHER
    if (requestedRole === 'teacher') {
      const isAuthorizedAdmin = requester && requester.role === 'admin';
      const hasValidBootstrapKey = setupKey && setupKey === config.adminSetupKey;

      if (!isAuthorizedAdmin && !hasValidBootstrapKey) {
        throw ApiError.forbidden(
          'Teacher accounts cannot be registered publicly. They must be provisioned by the school administrator.'
        );
      }
    }

    // Only allow PARENT or STUDENT for public self-registration
    const allowedPublicRoles = ['student', 'parent'];
    const finalRole =
      requester?.role === 'admin' || (setupKey && setupKey === config.adminSetupKey)
        ? requestedRole
        : allowedPublicRoles.includes(requestedRole)
        ? requestedRole
        : 'student';

    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict(`An account with email '${userData.email}' already exists`);
    }

    // Create user (unlinked by default)
    const user = await User.create({
      ...userData,
      email: userData.email.toLowerCase(),
      role: finalRole,
      isLinked: false,
    });

    // If an administrator provided a linkingCode during registration, attempt verified link
    let linkingResult = null;
    if (userData.linkingCode) {
      try {
        linkingResult = await AccountLinkingService.redeemLinkingCode(user, {
          linkingCode: userData.linkingCode,
          admissionNumber: userData.admissionNumber,
        });
        user.isLinked = true;
        await user.save();
      } catch (err) {
        // Rollback user creation if explicitly requested with invalid linking code
        await User.findByIdAndDelete(user._id);
        throw err;
      }
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isLinked: user.isLinked,
      linkingResult,
      message: user.isLinked
        ? 'Account successfully registered and verified.'
        : 'Account registered. Your account is currently unlinked. Please contact school administration to link your student or parent profile.',
    };
  }
}

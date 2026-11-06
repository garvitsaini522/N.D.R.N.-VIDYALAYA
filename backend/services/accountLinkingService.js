import crypto from 'crypto';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { ApiError } from '../utils/apiError.js';

export class AccountLinkingService {
  /**
   * Helper: Ensure requester has administrator privileges
   */
  static verifyAdmin(requester) {
    if (!requester || requester.role !== 'admin') {
      throw ApiError.forbidden('Administrative authorization is required to manage account linkages.');
    }
  }

  /**
   * Link a Student User account to an official Student MongoDB record
   */
  static async linkStudentAccount({ userId, studentId, admissionNumber }, requester) {
    this.verifyAdmin(requester);

    if (!userId || (!studentId && !admissionNumber)) {
      throw ApiError.badRequest('User ID and either Student ID or Admission Number are required.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound(`User account with ID '${userId}' not found.`);
    }

    if (user.role !== 'student') {
      throw ApiError.badRequest(
        `Cannot link user '${user.email}' to student record: user role is '${user.role}', expected 'student'.`
      );
    }

    const studentQuery = studentId
      ? { _id: studentId }
      : { admissionNumber: String(admissionNumber).trim().toUpperCase() };

    const student = await Student.findOne(studentQuery);
    if (!student) {
      throw ApiError.notFound('Target student record not found.');
    }

    // Security check: Check if student is already linked to another user
    if (student.user && student.user.toString() !== user._id.toString()) {
      const existingLinkedUser = await User.findById(student.user).select('email name');
      throw ApiError.conflict(
        `Student '${student.fullName}' (${student.admissionNumber}) is already linked to user account '${
          existingLinkedUser?.email || student.user
        }'. Unlink it first.`
      );
    }

    // Security check: Check if user is already linked to another student
    if (user.student && user.student.toString() !== student._id.toString()) {
      throw ApiError.conflict(
        `User account '${user.email}' is already linked to another student record (${user.student}). Unlink it first.`
      );
    }

    // Establish bidirectional link
    student.user = user._id;
    student.linkingCode = undefined;
    student.linkingCodeExpires = undefined;
    await student.save();

    user.student = student._id;
    user.isLinked = true;
    await user.save();

    return {
      success: true,
      message: `User '${user.email}' successfully linked to student '${student.fullName}' (${student.admissionNumber}).`,
      userId: user._id,
      studentId: student._id,
      admissionNumber: student.admissionNumber,
      studentName: student.fullName,
    };
  }

  /**
   * Unlink a Student User account from an official Student record
   */
  static async unlinkStudentAccount({ userId, studentId }, requester) {
    this.verifyAdmin(requester);

    if (!userId && !studentId) {
      throw ApiError.badRequest('Either User ID or Student ID must be specified.');
    }

    let user = userId ? await User.findById(userId) : null;
    let student = studentId ? await Student.findById(studentId) : null;

    if (!student && user?.student) {
      student = await Student.findById(user.student);
    }
    if (!user && student?.user) {
      user = await User.findById(student.user);
    }

    if (student) {
      student.user = null;
      await student.save();
    }

    if (user) {
      user.student = null;
      user.isLinked = false;
      await user.save();
    }

    return {
      success: true,
      message: 'Student account link successfully removed.',
    };
  }

  /**
   * Link a Parent User account to an official Parent MongoDB record
   */
  static async linkParentAccount({ userId, parentId, studentIds = [] }, requester) {
    this.verifyAdmin(requester);

    if (!userId || !parentId) {
      throw ApiError.badRequest('User ID and Parent ID are required.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound(`User account with ID '${userId}' not found.`);
    }

    if (user.role !== 'parent') {
      throw ApiError.badRequest(
        `Cannot link user '${user.email}' to parent record: user role is '${user.role}', expected 'parent'.`
      );
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw ApiError.notFound(`Parent record with ID '${parentId}' not found.`);
    }

    // Security check: Check if parent is already linked to another user
    if (parent.user && parent.user.toString() !== user._id.toString()) {
      const existingLinkedUser = await User.findById(parent.user).select('email name');
      throw ApiError.conflict(
        `Parent record '${parent.primaryContact?.name || parent._id}' is already linked to user account '${
          existingLinkedUser?.email || parent.user
        }'. Unlink it first.`
      );
    }

    // Security check: Check if user is already linked to another parent
    if (user.parent && user.parent.toString() !== parent._id.toString()) {
      throw ApiError.conflict(
        `User account '${user.email}' is already linked to another parent record (${user.parent}). Unlink it first.`
      );
    }

    // Attach student wards if provided
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      for (const sid of studentIds) {
        const student = await Student.findById(sid);
        if (student) {
          if (!parent.students.some((s) => s.toString() === student._id.toString())) {
            parent.students.push(student._id);
          }
          student.parent = parent._id;
          await student.save();
        }
      }
    }

    parent.user = user._id;
    parent.linkingCode = undefined;
    parent.linkingCodeExpires = undefined;
    await parent.save();

    user.parent = parent._id;
    user.isLinked = parent.students && parent.students.length > 0;
    await user.save();

    return {
      success: true,
      message: `User '${user.email}' successfully linked to parent record.`,
      userId: user._id,
      parentId: parent._id,
      wardCount: parent.students.length,
    };
  }

  /**
   * Unlink a Parent User account from an official Parent record
   */
  static async unlinkParentAccount({ userId, parentId }, requester) {
    this.verifyAdmin(requester);

    if (!userId && !parentId) {
      throw ApiError.badRequest('Either User ID or Parent ID must be specified.');
    }

    let user = userId ? await User.findById(userId) : null;
    let parent = parentId ? await Parent.findById(parentId) : null;

    if (!parent && user?.parent) {
      parent = await Parent.findById(user.parent);
    }
    if (!user && parent?.user) {
      user = await User.findById(parent.user);
    }

    if (parent) {
      parent.user = null;
      await parent.save();
    }

    if (user) {
      user.parent = null;
      user.isLinked = false;
      await user.save();
    }

    return {
      success: true,
      message: 'Parent account link successfully removed.',
    };
  }

  /**
   * Link a Student ward to a Parent record
   */
  static async linkParentWard({ parentId, studentId, admissionNumber }, requester) {
    this.verifyAdmin(requester);

    if (!parentId || (!studentId && !admissionNumber)) {
      throw ApiError.badRequest('Parent ID and Student ID or Admission Number are required.');
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw ApiError.notFound('Parent record not found.');
    }

    const studentQuery = studentId
      ? { _id: studentId }
      : { admissionNumber: String(admissionNumber).trim().toUpperCase() };

    const student = await Student.findOne(studentQuery);
    if (!student) {
      throw ApiError.notFound('Student record not found.');
    }

    if (!parent.students.some((s) => s.toString() === student._id.toString())) {
      parent.students.push(student._id);
      await parent.save();
    }

    student.parent = parent._id;
    await student.save();

    // If parent has a linked user account, mark it as linked
    if (parent.user) {
      await User.findByIdAndUpdate(parent.user, { isLinked: true });
    }

    return {
      success: true,
      message: `Student '${student.fullName}' successfully added as ward to parent record.`,
      parentId: parent._id,
      studentId: student._id,
      totalWards: parent.students.length,
    };
  }

  /**
   * Unlink a Student ward from a Parent record
   */
  static async unlinkParentWard({ parentId, studentId }, requester) {
    this.verifyAdmin(requester);

    const parent = await Parent.findById(parentId);
    if (!parent) {
      throw ApiError.notFound('Parent record not found.');
    }

    parent.students = parent.students.filter((s) => s.toString() !== studentId.toString());
    await parent.save();

    const student = await Student.findById(studentId);
    if (student && student.parent?.toString() === parentId.toString()) {
      student.parent = null;
      await student.save();
    }

    if (parent.user && parent.students.length === 0) {
      await User.findByIdAndUpdate(parent.user, { isLinked: false });
    }

    return {
      success: true,
      message: 'Student ward successfully unlinked from parent.',
      remainingWards: parent.students.length,
    };
  }

  /**
   * Generate an administrator-controlled, cryptographically random linking code for a student or parent record
   */
  static async generateLinkingCode({ targetType, targetId, expiresInHours = 48 }, requester) {
    this.verifyAdmin(requester);

    const cleanType = String(targetType || '').toLowerCase();
    if (!['student', 'parent'].includes(cleanType)) {
      throw ApiError.badRequest("targetType must be either 'student' or 'parent'.");
    }

    if (!targetId) {
      throw ApiError.badRequest('targetId is required.');
    }

    const code = `LNK-${cleanType.toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    if (cleanType === 'student') {
      const isMongoId = mongoose.Types.ObjectId.isValid(targetId);
      const query = isMongoId ? { _id: targetId } : { admissionNumber: String(targetId).toUpperCase() };
      const student = await Student.findOne(query);
      if (!student) throw ApiError.notFound('Student record not found.');

      student.linkingCode = code;
      student.linkingCodeExpires = expiresAt;
      await student.save();

      return {
        success: true,
        targetType: 'student',
        targetId: student._id,
        identifier: student.admissionNumber,
        targetName: student.fullName,
        linkingCode: code,
        expiresAt,
      };
    } else {
      const parent = await Parent.findById(targetId);
      if (!parent) throw ApiError.notFound('Parent record not found.');

      parent.linkingCode = code;
      parent.linkingCodeExpires = expiresAt;
      await parent.save();

      return {
        success: true,
        targetType: 'parent',
        targetId: parent._id,
        targetName: parent.primaryContact?.name || parent.fatherName || 'Parent',
        linkingCode: code,
        expiresAt,
      };
    }
  }

  /**
   * Redeem an administrator-issued linking code by an authenticated user
   */
  static async redeemLinkingCode(user, { linkingCode, admissionNumber }) {
    if (!linkingCode) {
      throw ApiError.badRequest('A valid linkingCode is required.');
    }

    const cleanCode = String(linkingCode).trim();
    const now = new Date();

    if (user.role === 'student') {
      const studentQuery = {
        linkingCode: cleanCode,
        linkingCodeExpires: { $gt: now },
      };
      if (admissionNumber) {
        studentQuery.admissionNumber = String(admissionNumber).trim().toUpperCase();
      }

      const student = await Student.findOne(studentQuery).select('+linkingCode +linkingCodeExpires');
      if (!student) {
        throw ApiError.badRequest('Invalid or expired linking code. Please contact school administration.');
      }

      if (student.user && student.user.toString() !== user._id.toString()) {
        throw ApiError.conflict('This student record is already linked to another account.');
      }

      if (user.student && user.student.toString() !== student._id.toString()) {
        throw ApiError.conflict('Your account is already linked to a student record. Contact administration to unlink.');
      }

      student.user = user._id;
      student.linkingCode = undefined;
      student.linkingCodeExpires = undefined;
      await student.save();

      await User.findByIdAndUpdate(user._id, {
        student: student._id,
        isLinked: true,
      });

      return {
        success: true,
        message: `Account successfully linked to student '${student.fullName}' (${student.admissionNumber}).`,
        studentId: student._id,
        admissionNumber: student.admissionNumber,
        studentName: student.fullName,
      };
    } else if (user.role === 'parent') {
      const parent = await Parent.findOne({
        linkingCode: cleanCode,
        linkingCodeExpires: { $gt: now },
      }).select('+linkingCode +linkingCodeExpires');

      if (!parent) {
        throw ApiError.badRequest('Invalid or expired linking code. Please contact school administration.');
      }

      if (parent.user && parent.user.toString() !== user._id.toString()) {
        throw ApiError.conflict('This parent record is already linked to another account.');
      }

      if (user.parent && user.parent.toString() !== parent._id.toString()) {
        throw ApiError.conflict('Your account is already linked to a parent record. Contact administration to unlink.');
      }

      parent.user = user._id;
      parent.linkingCode = undefined;
      parent.linkingCodeExpires = undefined;
      await parent.save();

      await User.findByIdAndUpdate(user._id, {
        parent: parent._id,
        isLinked: parent.students && parent.students.length > 0,
      });

      return {
        success: true,
        message: 'Account successfully linked to official parent record.',
        parentId: parent._id,
        wardCount: parent.students.length,
      };
    } else {
      throw ApiError.badRequest(`Account linking with a code is not applicable for role '${user.role}'.`);
    }
  }

  /**
   * Get unlinked student and parent user accounts for administrative overview
   */
  static async getUnlinkedAccounts(requester) {
    this.verifyAdmin(requester);

    const unlinkedUsers = await User.find({
      role: { $in: ['student', 'parent'] },
      isLinked: false,
      status: 'active',
    })
      .select('name email phone role createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return unlinkedUsers;
  }
}


import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';

/**
 * Access control middleware for Student & Parent Portal
 * Enforces:
 * - A student must only see their own information.
 * - A parent must only see their verified linked child/children.
 * - Unlinked student or parent accounts are blocked from accessing student academic records.
 * - Teachers are permitted access only to records within their assigned classes/wing.
 * - Never treats missing ownership information or empty ward IDs as permission.
 * - Reject invalid, missing, or unauthorized student IDs.
 * - Administrators retain authorized management access.
 */
export async function enforceStudentOrParentDataIsolation(req, res, next) {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }

  const {
    role,
    id: userId,
    studentId: userStudentId,
    admissionNumber: userAdmissionNo,
    wardIds = [],
    isLinked,
  } = req.user;

  // 1. School administrators & staff retain authorized management access
  if (role === 'admin' || role === 'staff') {
    return next();
  }

  // 2. Teachers: Can only access records permitted by their assigned role and responsibilities
  if (role === 'teacher') {
    // Teachers are strictly forbidden from viewing student fee/financial records
    if (req.baseUrl?.includes('fee') || req.originalUrl?.includes('/fees')) {
      return ApiResponse.error(
        res,
        'Forbidden: Teachers are not authorized to access student fee records.',
        403
      );
    }

    const rawTargetId = req.params.studentId || req.params.id || req.query.studentId;
    const targetClassId = req.params.classId || req.query.classId || req.body?.classId;

    if (!rawTargetId && !targetClassId) {
      return next();
    }

    if (rawTargetId === 'me') {
      return next();
    }

    let teacherWing = req.user.wing;
    let assignedClasses = req.user.assignedClasses;

    if (!assignedClasses && mongoose.connection.readyState === 1) {
      const teacher = await Teacher.findOne({ user: userId }).lean();
      if (!teacher) {
        return ApiResponse.error(res, 'Forbidden: Teacher profile not found.', 403);
      }
      teacherWing = teacher.wing;
      assignedClasses = (teacher.assignedClasses || []).map((c) => c.toString());
    }

    if (teacherWing !== 'Administration') {
      const assignedClassStrings = (assignedClasses || []).map((c) => c.toString());

      // Check target class if provided
      if (targetClassId) {
        const stringTargetClassId = targetClassId.toString();
        if (assignedClassStrings.length === 0 || !assignedClassStrings.includes(stringTargetClassId)) {
          return ApiResponse.error(
            res,
            'Forbidden: Teachers are only permitted to access records for their assigned classes.',
            403
          );
        }
      }

      // Check target student if provided
      if (rawTargetId && mongoose.connection.readyState === 1) {
        const targetStudentId = String(rawTargetId).trim();
        const isMongoId = mongoose.Types.ObjectId.isValid(targetStudentId);
        const studentQuery = isMongoId
          ? { _id: targetStudentId }
          : { admissionNumber: targetStudentId.toUpperCase() };

        const targetStudent = await Student.findOne(studentQuery).select('class section').lean();
        if (!targetStudent) {
          return ApiResponse.error(res, 'Student record not found.', 404);
        }

        const studentClassId = targetStudent.class ? targetStudent.class.toString() : null;
        if (assignedClassStrings.length === 0 || !studentClassId || !assignedClassStrings.includes(studentClassId)) {
          return ApiResponse.error(
            res,
            'Forbidden: Teachers are only permitted to access records for students in their assigned classes.',
            403
          );
        }
      }
    }
    return next();
  }

  // Extract requested target student ID from route params, query, or request body
  const rawTargetId = req.params.studentId || req.params.id || req.query.studentId || req.body?.studentId;
  const targetStudentId = rawTargetId ? String(rawTargetId).trim() : null;

  // 3. Student Access Control: strictly own verified record
  if (role === 'student') {
    if (!isLinked || !userStudentId) {
      return ApiResponse.error(
        res,
        'Forbidden: Your student account is not yet linked to an official student record. Please contact school administration.',
        403
      );
    }

    // If no target student ID specified or accessing 'me', automatically constrain query to self
    if (!targetStudentId || targetStudentId === 'me') {
      if (req.params.studentId) req.params.studentId = userStudentId;
      if (req.params.id) req.params.id = userStudentId;
      req.query.studentId = userStudentId;
      if (req.body && typeof req.body === 'object' && req.body.studentId) {
        req.body.studentId = userStudentId;
      }
      return next();
    }

    // Check if target format is valid
    const isTargetObjectId = mongoose.Types.ObjectId.isValid(targetStudentId);
    const isTargetAdmissionNo = /^[A-Z0-9-]{3,20}$/i.test(targetStudentId);

    if (!isTargetObjectId && !isTargetAdmissionNo) {
      return ApiResponse.error(res, 'Invalid student identifier provided.', 400);
    }

    const isOwnRecord =
      targetStudentId === userStudentId ||
      (userAdmissionNo && targetStudentId.toUpperCase() === userAdmissionNo.toUpperCase());

    if (!isOwnRecord) {
      return ApiResponse.error(
        res,
        'Forbidden: Students are only permitted to access their own academic records.',
        403
      );
    }

    // Normalize parameter to verified student ID
    if (req.params.studentId) req.params.studentId = userStudentId;
    if (req.params.id) req.params.id = userStudentId;
    req.query.studentId = userStudentId;
    if (req.body && typeof req.body === 'object' && req.body.studentId) {
      req.body.studentId = userStudentId;
    }
    return next();
  }

  // 4. Parent Access Control: strictly verified linked children
  if (role === 'parent') {
    const allowedWards = Array.isArray(wardIds) ? wardIds.map((id) => id.toString()) : [];

    // Never treat missing ownership / empty ward IDs as permission
    if (!isLinked || allowedWards.length === 0) {
      return ApiResponse.error(
        res,
        'Forbidden: Parents are only permitted to access records for their linked children.',
        403
      );
    }

    // If no specific child targeted or 'me', constrain query to verified linked wards
    if (!targetStudentId || targetStudentId === 'me') {
      const defaultWard = allowedWards[0];
      if (req.params.studentId) req.params.studentId = defaultWard;
      if (req.params.id) req.params.id = defaultWard;
      if (allowedWards.length === 1) {
        req.query.studentId = defaultWard;
      } else {
        req.query.studentId = { $in: allowedWards };
      }
      if (req.body && typeof req.body === 'object' && req.body.studentId) {
        req.body.studentId = defaultWard;
      }
      return next();
    }

    // Check if target format is valid
    const isTargetObjectId = mongoose.Types.ObjectId.isValid(targetStudentId);
    const isTargetAdmissionNo = /^[A-Z0-9-]{3,20}$/i.test(targetStudentId);

    if (!isTargetObjectId && !isTargetAdmissionNo) {
      return ApiResponse.error(res, 'Invalid student identifier provided.', 400);
    }

    // Verify target matches an allowed ward
    let matchedWardId = allowedWards.find((wid) => wid === targetStudentId);

    // If not matched directly by ObjectId, check if target was an admissionNumber
    if (!matchedWardId && mongoose.connection.readyState === 1) {
      const studentDoc = await Student.findOne({
        _id: { $in: allowedWards },
        admissionNumber: targetStudentId.toUpperCase(),
      }).select('_id').lean();
      if (studentDoc) {
        matchedWardId = studentDoc._id.toString();
      }
    }

    if (!matchedWardId) {
      return ApiResponse.error(
        res,
        'Forbidden: Parents are only permitted to access records for their linked children.',
        403
      );
    }

    // Normalize parameter to verified ward ObjectId
    if (req.params.studentId) req.params.studentId = matchedWardId;
    if (req.params.id) req.params.id = matchedWardId;
    req.query.studentId = matchedWardId;
    if (req.body && typeof req.body === 'object' && req.body.studentId) {
      req.body.studentId = matchedWardId;
    }
    return next();
  }

  // Unknown role
  return ApiResponse.error(res, 'Forbidden: Unauthorized portal access.', 403);
}

/**
 * Prevent students and parents from mutating protected academic records
 */
export function protectAcademicRecords(req, res, next) {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }

  if (req.user.role === 'student' || req.user.role === 'parent') {
    return ApiResponse.error(
      res,
      'Forbidden: Academic and financial records are protected and cannot be modified by students or parents.',
      403
    );
  }

  next();
}

/**
 * Access control middleware for Parent profile endpoints
 * Prevents unauthorized parents, unlinked accounts, or students from accessing/updating parent records.
 * Never treats missing parent records or missing parentId as permission.
 */
export function enforceParentAccessControl(req, res, next) {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }

  const { role, id: userId, parentId, isLinked } = req.user;

  // Administration and staff retain institutional oversight
  if (role === 'admin' || role === 'staff') {
    return next();
  }

  // Parents can only access their own profile
  if (role === 'parent') {
    if (!isLinked || !parentId) {
      return ApiResponse.error(
        res,
        'Forbidden: Your parent account is not linked to any official parent record.',
        403
      );
    }

    const targetId = req.params.id;
    const isSelf =
      targetId === 'me' ||
      targetId === parentId.toString();

    if (!isSelf) {
      return ApiResponse.error(
        res,
        'Forbidden: Parents are only permitted to access their own parent record.',
        403
      );
    }

    req.params.id = parentId.toString();
    return next();
  }

  // Students and other roles are completely forbidden from querying or modifying parent records
  return ApiResponse.error(
    res,
    'Forbidden: You are not authorized to view or modify parent records.',
    403
  );
}

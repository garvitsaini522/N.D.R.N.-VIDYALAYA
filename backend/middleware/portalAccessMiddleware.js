import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Access control middleware for Student & Parent Portal
 * Enforces:
 * - A student must only see their own information.
 * - A parent must only see their linked child/children.
 * - Non-authorized roles cannot access student/parent private data.
 */
export function enforceStudentOrParentDataIsolation(req, res, next) {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }

  const { role, id: userId, studentId: userStudentId, wardIds = [], wardId } = req.user;

  // School administration & educators have institutional oversight
  if (role === 'admin' || role === 'teacher' || role === 'staff') {
    return next();
  }

  // Requested target student ID from route params or query
  const targetStudentId = req.params.studentId || req.params.id || req.query.studentId;

  // Student Access Control: strictly own information
  if (role === 'student') {
    // If no target student ID specified or accessing 'me', automatically constrain query to self
    if (!targetStudentId || targetStudentId === 'me') {
      req.query.studentId = userStudentId || userId;
      return next();
    }

    const isOwnRecord =
      targetStudentId === userId ||
      targetStudentId === userStudentId ||
      targetStudentId === req.user.admissionNumber;

    if (!isOwnRecord) {
      return ApiResponse.error(
        res,
        'Forbidden: Students are only permitted to access their own academic records.',
        403
      );
    }
    return next();
  }

  // Parent Access Control: strictly linked children
  if (role === 'parent') {
    const allowedWards = [
      ...(Array.isArray(wardIds) ? wardIds : []),
      ...(wardId ? [wardId] : []),
      ...(req.user.ward?.id ? [req.user.ward.id] : []),
    ];

    // If no specific child targeted, constrain collection query to linked wards
    if (!targetStudentId || targetStudentId === 'me') {
      if (allowedWards.length === 0) {
        return ApiResponse.error(
          res,
          'Forbidden: No linked student wards associated with this parent account.',
          403
        );
      }
      if (allowedWards.length === 1) {
        req.query.studentId = allowedWards[0];
      } else {
        req.query.studentId = { $in: allowedWards };
      }
      return next();
    }

    // If specific child requested, verify linkage
    if (allowedWards.length > 0) {
      const isLinkedChild = allowedWards.includes(targetStudentId);
      if (!isLinkedChild) {
        return ApiResponse.error(
          res,
          'Forbidden: Parents are only permitted to access records for their linked children.',
          403
        );
      }
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
 * Prevents students and unauthorized parents from querying parent records.
 */
export function enforceParentAccessControl(req, res, next) {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }

  const { role, id: userId, parentId } = req.user;

  // Administration, staff, and faculty educators have institutional oversight
  if (role === 'admin' || role === 'teacher' || role === 'staff') {
    return next();
  }

  // Parents can only access their own profile
  if (role === 'parent') {
    const targetId = req.params.id;
    if (targetId === 'me' || targetId === userId || targetId === parentId) {
      return next();
    }
    return ApiResponse.error(
      res,
      'Forbidden: Parents are only permitted to access their own parent record.',
      403
    );
  }

  // Students and other roles are completely forbidden from querying parent records
  return ApiResponse.error(
    res,
    'Forbidden: You are not authorized to view parent records.',
    403
  );
}

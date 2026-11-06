import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Teacher } from '../models/Teacher.js';

/**
 * Verify JWT authentication token from Authorization header
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authentication required. No Bearer token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    // Initial payload extraction (safe offline fallback; authoritatively overwritten when database is connected)
    const authUser = {
      ...decoded,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      isLinked: decoded.isLinked !== undefined
        ? Boolean(decoded.isLinked)
        : Boolean(decoded.studentId || (Array.isArray(decoded.wardIds) && decoded.wardIds.length > 0)),
      studentId: decoded.studentId || null,
      parentId: decoded.parentId || null,
      wardIds: Array.isArray(decoded.wardIds) ? decoded.wardIds : [],
    };

    // Authoritative live database check:
    // When MongoDB is connected, NEVER trust client-supplied or JWT-supplied relationship claims.
    // Overwrite all linkages with authoritatively verified MongoDB records.
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('status tokenInvalidatedAt role');
      if (!user) {
        return ApiResponse.error(res, 'User associated with this token no longer exists.', 401);
      }
      if (user.status !== 'active') {
        return ApiResponse.error(res, `Account is ${user.status}. Please contact administration.`, 403);
      }
      if (user.tokenInvalidatedAt && decoded.iat * 1000 <= user.tokenInvalidatedAt.getTime()) {
        return ApiResponse.error(res, 'Session has been invalidated upon logout. Please login again.', 401);
      }

      authUser.role = user.role;

      // Authoritative database-verified relationship checks (strictly require matching user reference)
      if (user.role === 'student') {
        let student = await Student.findOne({ user: user._id }).lean();
        if (!student && user.student) {
          const candidate = await Student.findById(user.student).lean();
          if (candidate && candidate.user && candidate.user.toString() === user._id.toString()) {
            student = candidate;
          }
        }

        if (student) {
          authUser.isLinked = true;
          authUser.studentId = student._id.toString();
          authUser.admissionNumber = student.admissionNumber;
          authUser.student = student;
        } else {
          authUser.isLinked = false;
          authUser.studentId = null;
          authUser.admissionNumber = null;
        }
      } else if (user.role === 'parent') {
        let parent = await Parent.findOne({ user: user._id }).lean();
        if (!parent && user.parent) {
          const candidate = await Parent.findById(user.parent).lean();
          if (candidate && candidate.user && candidate.user.toString() === user._id.toString()) {
            parent = candidate;
          }
        }

        if (parent) {
          const wardIds = (parent.students || []).filter(Boolean).map((s) => s.toString());
          authUser.parentId = parent._id.toString();
          authUser.wardIds = wardIds;
          authUser.isLinked = wardIds.length > 0;
          authUser.parent = parent;
        } else {
          authUser.parentId = null;
          authUser.wardIds = [];
          authUser.isLinked = false;
        }
      } else if (user.role === 'teacher') {
        const teacher = await Teacher.findOne({ user: user._id }).lean();
        if (teacher) {
          authUser.isLinked = true;
          authUser.teacherId = teacher._id.toString();
          authUser.employeeId = teacher.employeeId;
          authUser.assignedClasses = (teacher.assignedClasses || []).map((c) => c.toString());
          authUser.wing = teacher.wing;
          authUser.teacher = teacher;
        } else {
          authUser.isLinked = false;
          authUser.teacherId = null;
          authUser.assignedClasses = [];
          authUser.wing = null;
        }
      } else if (user.role === 'admin') {
        authUser.isLinked = true;
      }
    }

    req.user = authUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Authentication token expired. Please login again.', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token.', 401);
  }
}

/**
 * Restrict access to specific roles
 * @param  {...string} roles Allowed roles (e.g. 'admin', 'teacher', 'staff')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
}

/**
 * Optional authentication middleware: populates req.user if token is present and valid,
 * but does not fail if no token is provided.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch (err) {
    // Ignore invalid optional tokens
    req.user = null;
  }

  next();
}

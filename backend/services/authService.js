import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

export class AuthService {
  /**
   * Generate signed JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
  }

  /**
   * Authenticate user credentials (email, phone, or identifier)
   */
  static async login(identifier, password) {
    if (!identifier || !password) {
      throw ApiError.badRequest('Identifier (email/phone) and password are required');
    }

    const trimmed = identifier.trim();
    const query = trimmed.includes('@')
      ? { email: trimmed.toLowerCase() }
      : { $or: [{ email: trimmed.toLowerCase() }, { phone: trimmed }] };

    const user = await User.findOne(query).select('+password');

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

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Create a new user with role-based restriction enforcement
   * Public users CANNOT freely register as ADMIN.
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

    const user = await User.create({
      ...userData,
      email: userData.email.toLowerCase(),
      role: finalRole,
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    };
  }
}

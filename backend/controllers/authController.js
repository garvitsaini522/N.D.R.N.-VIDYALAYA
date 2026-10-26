import { AuthService } from '../services/authService.js';
import { User } from '../models/User.js';
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
    return ApiResponse.success(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      'Current user profile retrieved'
    );
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

import { Router } from 'express';
import { login, getMe, register, logout } from '../controllers/authController.js';
import { loginRules, registerRules } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';

const router = Router();

// POST /api/auth/login - User authentication
router.post('/login', authLimiter, loginRules, validate, requireDatabase, login);

// POST /api/auth/register - User registration (Public for student/parent; Admin-guarded for admin/teacher)
router.post('/register', optionalAuth, registerRules, validate, requireDatabase, register);

// GET /api/auth/me - Retrieve current user profile
router.get('/me', authenticate, requireDatabase, getMe);

// POST /api/auth/logout - Invalidate session and tokens
router.post('/logout', authenticate, requireDatabase, logout);

export default router;

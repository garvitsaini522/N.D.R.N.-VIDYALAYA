import { Router } from 'express';
import {
  login,
  getMe,
  register,
  logout,
  linkAccount,
  adminLinkStudent,
  adminUnlinkStudent,
  adminLinkParent,
  adminUnlinkParent,
  adminLinkWard,
  adminUnlinkWard,
  adminGenerateLinkCode,
  adminGetUnlinkedUsers,
} from '../controllers/authController.js';
import { loginRules, registerRules } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticate, authorize, optionalAuth } from '../middleware/authMiddleware.js';
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

// POST /api/auth/link-account - Self-service linking with an administrator-issued code
router.post('/link-account', authenticate, requireDatabase, linkAccount);

// ==============================================================================
// Administrative Account-Linking Endpoints (Protected: Admin Only)
// ==============================================================================
router.post('/admin/link-student', authenticate, authorize('admin'), requireDatabase, adminLinkStudent);
router.post('/admin/unlink-student', authenticate, authorize('admin'), requireDatabase, adminUnlinkStudent);
router.post('/admin/link-parent', authenticate, authorize('admin'), requireDatabase, adminLinkParent);
router.post('/admin/unlink-parent', authenticate, authorize('admin'), requireDatabase, adminUnlinkParent);
router.post('/admin/link-ward', authenticate, authorize('admin'), requireDatabase, adminLinkWard);
router.post('/admin/unlink-ward', authenticate, authorize('admin'), requireDatabase, adminUnlinkWard);
router.post('/admin/generate-link-code', authenticate, authorize('admin'), requireDatabase, adminGenerateLinkCode);
router.get('/admin/unlinked-users', authenticate, authorize('admin'), requireDatabase, adminGetUnlinkedUsers);

export default router;

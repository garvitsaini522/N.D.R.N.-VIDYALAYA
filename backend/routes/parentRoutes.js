import { Router } from 'express';
import {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  linkParentWard,
  unlinkParentWard,
} from '../controllers/parentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceParentAccessControl } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// GET /api/parents
router.get('/', authenticate, authorize('admin', 'staff'), requireDatabase, getParents);

// GET /api/parents/:id (Enforces role authorization & ownership)
router.get('/:id', authenticate, enforceParentAccessControl, requireDatabase, getParentById);

// PUT /api/parents/:id (Enforces ownership and rejects unauthorized access or non-existent parent records)
router.put('/:id', authenticate, enforceParentAccessControl, requireDatabase, updateParent);

// POST /api/parents (Admin only)
router.post('/', authenticate, authorize('admin'), requireDatabase, createParent);

// DELETE /api/parents/:id (Admin only)
router.delete('/:id', authenticate, authorize('admin'), requireDatabase, deleteParent);

// POST /api/parents/:id/wards (Admin only: link a ward)
router.post('/:id/wards', authenticate, authorize('admin'), requireDatabase, linkParentWard);

// DELETE /api/parents/:id/wards/:studentId (Admin only: unlink a ward)
router.delete('/:id/wards/:studentId', authenticate, authorize('admin'), requireDatabase, unlinkParentWard);

export default router;

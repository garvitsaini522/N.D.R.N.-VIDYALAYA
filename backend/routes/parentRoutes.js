import { Router } from 'express';
import { getParents, getParentById, createParent } from '../controllers/parentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { requireDatabase } from '../middleware/dbCheckMiddleware.js';
import { enforceParentAccessControl } from '../middleware/portalAccessMiddleware.js';

const router = Router();

// GET /api/parents
router.get('/', authenticate, authorize('admin', 'staff'), requireDatabase, getParents);

// GET /api/parents/:id (Enforces role authorization & ownership)
router.get('/:id', authenticate, enforceParentAccessControl, requireDatabase, getParentById);

// POST /api/parents
router.post('/', authenticate, authorize('admin'), requireDatabase, createParent);

export default router;

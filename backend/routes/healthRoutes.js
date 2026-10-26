import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

// GET /api/health - Health check and MongoDB status
router.get('/', getHealth);

export default router;

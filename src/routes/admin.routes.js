import { Router } from 'express';
import { dashboardSummary } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();
router.get('/summary', authMiddleware, roleMiddleware('admin', 'staff'), dashboardSummary);

export default router;

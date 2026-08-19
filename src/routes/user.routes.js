import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { getAllUsers, updateUserRole, toggleUserActive } from '../controllers/user.controller.js';

const router = Router();

router.get('/admin/all', authMiddleware, roleMiddleware('admin', 'staff'), getAllUsers);
router.patch('/admin/:id/role', authMiddleware, roleMiddleware('admin', 'staff'), updateUserRole);
router.patch('/admin/:id/toggle-active', authMiddleware, roleMiddleware('admin', 'staff'), toggleUserActive);

export default router;

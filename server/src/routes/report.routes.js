import { Router } from 'express';
import { orderReport, monthlySalesSummary, rawSalesReport } from '../controllers/report.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

router.get('/orders', authMiddleware, roleMiddleware('admin', 'staff'), orderReport);
router.get('/orders/monthly', authMiddleware, roleMiddleware('admin', 'staff'), monthlySalesSummary);
router.get('/orders/raw', authMiddleware, roleMiddleware('admin', 'staff'), rawSalesReport);

export default router;
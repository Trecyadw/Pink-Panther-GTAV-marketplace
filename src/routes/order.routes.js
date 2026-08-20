import { Router } from 'express';
import {
  cancelMyOrder,
  createOrder,
  getAllOrders,
  getGroupedOrdersByUser,
  getMyOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getMyOrders);
router.patch('/:id/cancel', authMiddleware, cancelMyOrder);

router.get('/admin/all', authMiddleware, roleMiddleware('admin', 'staff'), getAllOrders);
router.get('/admin/grouped', authMiddleware, roleMiddleware('admin', 'staff'), getGroupedOrdersByUser);
router.patch('/admin/:id/status', authMiddleware, roleMiddleware('admin', 'staff'), updateOrderStatus);

export default router;
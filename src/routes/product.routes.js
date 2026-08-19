import { Router } from 'express';
import { createProduct, getAdminProducts, getProducts, getStockLogs, restockProduct, updateProduct } from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';

const router = Router();
router.get('/', getProducts);
router.get('/admin', authMiddleware, roleMiddleware('admin', 'staff'), getAdminProducts);
router.get('/stock-logs/all', authMiddleware, roleMiddleware('admin', 'staff'), getStockLogs);
router.post('/', authMiddleware, roleMiddleware('admin', 'staff'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'staff'), updateProduct);
router.post('/:id/restock', authMiddleware, roleMiddleware('admin', 'staff'), restockProduct);

export default router;

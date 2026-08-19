import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reportRoutes from './routes/report.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://pink-panther-gtav-marketplace-qxac.vercel.app", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

export default app;

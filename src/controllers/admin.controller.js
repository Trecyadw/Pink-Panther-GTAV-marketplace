import { pool } from '../config/db.js';

export async function dashboardSummary(req, res) {
  const [[users]] = await pool.query('SELECT COUNT(*) AS total FROM users');
  const [[products]] = await pool.query('SELECT COUNT(*) AS total FROM products');
  const [[orders]] = await pool.query('SELECT COUNT(*) AS total FROM orders');
  const [[pending]] = await pool.query("SELECT COUNT(*) AS total FROM orders WHERE order_status = 'pending'");

  return res.json({
    users: users.total,
    products: products.total,
    orders: orders.total,
    pendingOrders: pending.total,
  });
}

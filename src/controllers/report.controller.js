import { pool } from '../config/db.js';

export async function orderReport(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) AS order_date, 
        COUNT(*) AS total_orders, 
        SUM(total_price) AS total_amount
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY order_date DESC
      LIMIT 30
    `);

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function monthlySalesSummary(req, res) {
  try {
    const { year } = req.query;

    const [rows] = await pool.query(
      `
      SELECT 
        YEAR(o.created_at) AS year,
        MONTH(o.created_at) AS month,
        COUNT(DISTINCT o.id) AS total_orders,
        SUM(oi.qty) AS total_items_sold,
        SUM(oi.subtotal) AS total_sales
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.order_status IN ('confirmed', 'paid_ingame', 'processed', 'completed')
        AND (? IS NULL OR YEAR(o.created_at) = ?)
      GROUP BY YEAR(o.created_at), MONTH(o.created_at)
      ORDER BY year DESC, month DESC
      `,
      [year || null, year || null]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function rawSalesReport(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const [rows] = await pool.query(
      `
      SELECT
        oi.id AS order_item_id,
        o.id AS order_id,
        o.order_code,
        o.created_at AS order_datetime,
        o.user_id,
        u.username,
        u.ic_name,
        o.payment_method,
        o.payment_status,
        o.order_status,
        c.name AS category,
        p.item_class,
        p.id AS product_id,
        oi.product_name,
        oi.price,
        oi.qty,
        oi.subtotal,
        o.notes
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN users u ON u.id = o.user_id
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.order_status IN ('confirmed', 'paid_ingame', 'processed', 'completed')
        AND (? IS NULL OR DATE(o.created_at) >= ?)
        AND (? IS NULL OR DATE(o.created_at) <= ?)
      ORDER BY o.created_at DESC, oi.id DESC
      `,
      [
        startDate || null, startDate || null,
        endDate || null, endDate || null
      ]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
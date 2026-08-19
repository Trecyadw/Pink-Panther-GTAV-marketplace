import { pool } from '../config/db.js';
import { createOrderWithItems } from '../services/order.service.js';
import { updateOrderStatusInSheet } from '../config/sheets.js';

export async function createOrder(req, res) {
  try {
    const { items, notes } = req.body;
    const result = await createOrderWithItems({
      userId: req.user.id,
      items,
      notes,
    });
    return res.status(201).json({ message: 'Order berhasil dibuat', ...result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getMyOrders(req, res) {
  try {
    const [orders] = await pool.query(
      `
      SELECT 
        o.*,
        GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.qty) SEPARATOR ', ') AS item_summary
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      `,
      [req.user.id]
    );

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        u.username,
        u.ic_name,
        GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.qty) SEPARATOR ', ') AS item_summary
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getGroupedOrdersByUser(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        o.user_id,
        u.username,
        u.ic_name,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(oi.qty), 0) AS total_qty,
        COALESCE(SUM(oi.subtotal), 0) AS total_belanja,
        COUNT(DISTINCT CASE WHEN o.order_status = 'pending' THEN o.id END) AS pending_orders,
        COUNT(DISTINCT CASE WHEN o.order_status = 'processed' THEN o.id END) AS processed_orders,
        COUNT(DISTINCT CASE WHEN o.order_status = 'completed' THEN o.id END) AS completed_orders,
        GROUP_CONCAT(DISTINCT CONCAT(oi.product_name, ' x', oi.qty) SEPARATOR ', ') AS item_summary
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.user_id, u.username, u.ic_name
      ORDER BY total_belanja DESC, total_orders DESC
    `);

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function cancelMyOrder(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;

    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
      [id, req.user.id]
    );

    const order = orders[0];
    if (!order) {
      await conn.rollback();
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    if (order.order_status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ message: 'Hanya order pending yang bisa dibatalkan' });
    }

    const [items] = await conn.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    for (const item of items) {
      const [productRows] = await conn.query(
        'SELECT stock FROM products WHERE id = ? LIMIT 1',
        [item.product_id]
      );

      if (!productRows.length) continue;

      const oldStock = Number(productRows[0].stock);
      const restoredQty = Number(item.qty);
      const newStock = oldStock + restoredQty;

      await conn.query(
        'UPDATE products SET stock = ? WHERE id = ?',
        [newStock, item.product_id]
      );

      await conn.query(
        `INSERT INTO stock_logs (product_id, user_id, action_type, old_stock, stock_change, new_stock, note)
         VALUES (?, ?, 'restock', ?, ?, ?, ?)`,
        [
          item.product_id,
          req.user.id,
          oldStock,
          restoredQty,
          newStock,
          `Cancel order ${order.order_code}`,
        ]
      );
    }

    await conn.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      ['cancelled', id]
    );

    await conn.query(
      `INSERT INTO order_logs (order_id, user_id, from_status, to_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, order.order_status, 'cancelled', 'Order dibatalkan user']
    );

    await conn.commit();

    await updateOrderStatusInSheet({
      orderId: id,
      paymentStatus: order.payment_status,
      orderStatus: 'cancelled',
    });

    return res.json({ message: 'Order berhasil dibatalkan' });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { order_status, payment_status, note } = req.body;

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    const order = orders[0];

    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' });
    }

    const finalOrderStatus = order_status || order.order_status;
    const finalPaymentStatus = payment_status || order.payment_status;

    await pool.query(
      'UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?',
      [finalOrderStatus, finalPaymentStatus, id]
    );

    await pool.query(
      `INSERT INTO order_logs (order_id, user_id, from_status, to_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, order.order_status, finalOrderStatus, note || 'Status diupdate admin']
    );

    await updateOrderStatusInSheet({
      orderId: id,
      paymentStatus: finalPaymentStatus,
      orderStatus: finalOrderStatus,
    });

    return res.json({ message: 'Status order berhasil diupdate' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
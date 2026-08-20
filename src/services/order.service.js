import { pool } from '../config/db.js';
import { appendOrderToSheet } from '../config/sheets.js';
import { generateOrderCode } from '../utils/orderCode.js';

export async function createOrderWithItems({ userId, items, notes }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (!Array.isArray(items) || items.length === 0) throw new Error('Item order kosong');

    let totalPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1', [item.product_id]);
      const product = rows[0];
      if (!product) throw new Error(`Produk ${item.product_id} tidak ditemukan`);
      if (Number(item.qty) <= 0) throw new Error(`Qty untuk ${product.name} tidak valid`);
      if (Number(item.qty) > Number(product.max_order_qty)) {
        throw new Error(`Max order untuk ${product.name} adalah ${product.max_order_qty} ${product.order_unit}`);
      }
      if (Number(product.stock) < Number(item.qty)) throw new Error(`Stok produk ${product.name} tidak cukup`);

      const subtotal = Number(product.price) * Number(item.qty);
      totalPrice += subtotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        price: Number(product.price),
        qty: Number(item.qty),
        subtotal,
        gang: product.gang || 'Lainnya', // <-- Menangkap data Gang dari database di sini
      });
    }

    const orderCode = generateOrderCode();
    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_code, user_id, total_price, payment_method, payment_status, order_status, notes)
       VALUES (?, ?, ?, 'ingame', 'unpaid', 'pending', ?)`,
      [orderCode, userId, totalPrice, notes || null]
    );

    const orderId = orderResult.insertId;

    for (const item of validatedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, qty, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.price, item.qty, item.subtotal]
      );

      const [productRows] = await conn.query('SELECT stock FROM products WHERE id = ?', [item.product_id]);
      const oldStock = Number(productRows[0].stock);
      const newStock = oldStock - item.qty;

      await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.product_id]);
      await conn.query(
        `INSERT INTO stock_logs (product_id, user_id, action_type, old_stock, stock_change, new_stock, note)
         VALUES (?, ?, 'deduct', ?, ?, ?, ?)`,
        [item.product_id, userId, oldStock, -item.qty, newStock, `Order ${orderCode}`]
      );
    }

    await conn.query(
      `INSERT INTO order_logs (order_id, user_id, from_status, to_status, note)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, userId, null, 'pending', 'Order dibuat']
    );

    await conn.commit();

    const [fullRows] = await pool.query(
      `SELECT o.*, u.username, u.ic_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ?`,
      [orderId]
    );

    // Data items sekarang sudah memiliki property "gang" untuk dikirim ke sheets.js
    await appendOrderToSheet({ ...fullRows[0], items: validatedItems });
    return { orderId, orderCode };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
import slugify from 'slugify';
import { pool } from '../config/db.js';

export async function getProducts(req, res) {
  const [rows] = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1
    ORDER BY gang ASC, c.name ASC, p.item_class ASC, p.name ASC
  `);
  return res.json(rows);
}

export async function getAdminProducts(req, res) {
  const [rows] = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY gang ASC, c.name ASC, p.item_class ASC, p.name ASC
  `);
  return res.json(rows);
}

export async function createProduct(req, res) {
  try {
    // Menambahkan 'gang' ke dalam req.body
    const { gang, category_id, item_class, name, description, price, stock, max_order_qty, order_unit, image_url, is_active } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama produk wajib diisi' });

    const slug = `${slugify(name, { lower: true, strict: true })}-${Date.now()}`;
    await pool.query(
      `INSERT INTO products (gang, category_id, item_class, name, slug, description, price, stock, max_order_qty, order_unit, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        gang || 'Lainnya', // Default 'Lainnya' jika kosong
        category_id || null,
        item_class || null,
        name,
        slug,
        description || null,
        Number(price || 0),
        Number(stock || 0),
        Number(max_order_qty || 1),
        order_unit || 'pcs',
        image_url || null,
        is_active ? 1 : 0
      ]
    );
    return res.status(201).json({ message: 'Produk berhasil dibuat' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    // Menambahkan 'gang' ke dalam req.body
    const { gang, category_id, item_class, name, description, price, stock, max_order_qty, order_unit, image_url, is_active } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama produk wajib diisi' });

    const [beforeRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const before = beforeRows[0];
    if (!before) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    await pool.query(
      `UPDATE products
       SET gang = ?, category_id = ?, item_class = ?, name = ?, slug = ?, description = ?, price = ?, stock = ?, max_order_qty = ?, order_unit = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        gang || 'Lainnya', // Default 'Lainnya' jika kosong
        category_id || null,
        item_class || null,
        name,
        before.slug,
        description || null,
        Number(price || 0),
        Number(stock || 0),
        Number(max_order_qty || 1),
        order_unit || 'pcs',
        image_url || null,
        is_active ? 1 : 0,
        id
      ]
    );

    if (Number(before.stock) != Number(stock)) {
      await pool.query(
        `INSERT INTO stock_logs (product_id, user_id, action_type, old_stock, stock_change, new_stock, note)
         VALUES (?, ?, 'edit', ?, ?, ?, ?)`,
        [id, req.user.id, before.stock, Number(stock) - Number(before.stock), Number(stock), 'Manual edit stock']
      );
    }

    return res.json({ message: 'Produk berhasil diupdate' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function restockProduct(req, res) {
  try {
    const { id } = req.params;
    const { qty, note } = req.body;
    if (!qty || Number(qty) <= 0) return res.status(400).json({ message: 'Qty restock tidak valid' });

    const [rows] = await pool.query('SELECT stock FROM products WHERE id = ?', [id]);
    const product = rows[0];
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const oldStock = Number(product.stock);
    const newStock = oldStock + Number(qty);

    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);
    await pool.query(
      `INSERT INTO stock_logs (product_id, user_id, action_type, old_stock, stock_change, new_stock, note)
       VALUES (?, ?, 'restock', ?, ?, ?, ?)`,
      [id, req.user.id, oldStock, Number(qty), newStock, note || 'Restock admin']
    );

    return res.json({ message: 'Restock berhasil', oldStock, newStock });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getStockLogs(req, res) {
  const [rows] = await pool.query(`
    SELECT sl.*, p.name AS product_name, u.username
    FROM stock_logs sl
    JOIN products p ON p.id = sl.product_id
    JOIN users u ON u.id = sl.user_id
    ORDER BY sl.created_at DESC
  `);
  return res.json(rows);
}

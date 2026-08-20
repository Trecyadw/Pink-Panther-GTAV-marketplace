import { pool } from '../config/db.js';

export async function getAllUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, ic_name, role, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['member', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return res.json({ message: 'Role user berhasil diupdate' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function toggleUserActive(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, is_active FROM users WHERE id = ?',
      [id]
    );
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const newStatus = user.is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    return res.json({
      message: `User berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      is_active: newStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

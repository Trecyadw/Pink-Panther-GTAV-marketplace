import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';
dotenv.config();

export async function register(req, res) {
  try {
    const { username, password, ic_name } = req.body;
    if (!username || !password || !ic_name) return res.status(400).json({ message: 'Semua field wajib diisi' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter' });

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length) return res.status(400).json({ message: 'Username sudah dipakai' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash, ic_name, role) VALUES (?, ?, ?, ?)',
      [username, hash, ic_name, 'member']
    );
    return res.status(201).json({ message: 'Register berhasil' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1', [username]);
    const user = rows[0];
    if (!user) return res.status(400).json({ message: 'User tidak ditemukan' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, ic_name: user.ic_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, ic_name: user.ic_name, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function me(req, res) {
  const [rows] = await pool.query(
    'SELECT id, username, ic_name, role, is_active, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  return res.json(rows[0]);
}

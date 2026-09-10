/**
 * User Management Controller (Admin Operations)
 */

import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

export async function getAllUsers(req, res) {
  try {
    const { role, search } = req.query;
    let sql = 'SELECT id, name, email, phone, role, created_at FROM users';
    const params = [];

    if (role && ['ADMIN', 'STAFF', 'CLIENT'].includes(role.toUpperCase())) {
      sql += ' WHERE role = ?';
      params.push(role.toUpperCase());
    }

    sql += ' ORDER BY id DESC';
    const [users] = await query(sql, params);

    let filtered = users;
    if (search) {
      const q = search.toLowerCase();
      filtered = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }

    return res.json({ success: true, count: filtered.length, users: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const [users] = await query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: users[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, phone, password, role, department, employee_id } = req.body;
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userRes] = await query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), phone.trim(), hashedPassword, role.toUpperCase()]
    );

    const userId = userRes.insertId;
    if (role.toUpperCase() === 'CLIENT') {
      await query('INSERT INTO clients (user_id, address, kyc_status) VALUES (?, ?, ?)', [userId, 'Default Address', 'Verified']);
    } else if (role.toUpperCase() === 'STAFF') {
      await query('INSERT INTO staff (user_id, employee_id, department) VALUES (?, ?, ?)', [userId, employee_id || `EMP-${1000 + userId}`, department || 'Operations']);
    }

    return res.status(201).json({ success: true, message: 'User created successfully.', userId });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, role } = req.body;

    await query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), role = COALESCE(?, role) WHERE id = ?',
      [name, phone, role, id]
    );

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id == id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

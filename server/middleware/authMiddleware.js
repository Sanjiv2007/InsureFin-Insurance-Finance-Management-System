/**
 * Authentication Middleware
 * Verifies JWT token and attaches user information to the request
 */

import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'insurance_finance_secret_key_2026_academic_jwt');

    // Verify user still exists in database
    const [users] = await query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid session. User not found.' });
    }

    const user = users[0];

    // If client, fetch client_id
    if (user.role === 'CLIENT') {
      const [clients] = await query('SELECT id, kyc_status FROM clients WHERE user_id = ?', [user.id]);
      if (clients && clients.length > 0) {
        user.client_id = clients[0].id;
        user.kyc_status = clients[0].kyc_status;
      }
    }

    // If staff, fetch staff_id
    if (user.role === 'STAFF') {
      const [staff] = await query('SELECT id, employee_id, department FROM staff WHERE user_id = ?', [user.id]);
      if (staff && staff.length > 0) {
        user.staff_id = staff[0].id;
        user.employee_id = staff[0].employee_id;
        user.department = staff[0].department;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
}

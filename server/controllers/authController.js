/**
 * Auth Controller
 * Handles registration, login, JWT token generation, and profile retrieval
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function register(req, res) {
  try {
    const { name, email, country, phone, password, role, date_of_birth, address, employee_id, department } = req.body;

    // 1. Validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    if (!['ADMIN', 'STAFF', 'CLIENT'].includes(role.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid role selected.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // 2. Check if email already registered
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered. Please login.' });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert into users table (store country if present)
    const [userResult] = await query(
      `INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), phone.trim(), hashedPassword, role.toUpperCase()]
    );

    const userId = userResult.insertId;

    // 5. Create linked role table record
    if (role.toUpperCase() === 'CLIENT') {
      await query(
        `INSERT INTO clients (user_id, date_of_birth, address, kyc_status) VALUES (?, ?, ?, ?)`,
        [userId, date_of_birth || null, address || 'Not provided', 'Pending']
      );
    } else if (role.toUpperCase() === 'STAFF') {
      const empId = employee_id || `EMP-${1000 + userId}`;
      const dept = department || 'Underwriting & Claims';
      await query(
        `INSERT INTO staff (user_id, employee_id, department) VALUES (?, ?, ?)`,
        [userId, empId, dept]
      );
    }

    // 6. Create welcome notification
    await query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [userId, `Welcome to InsureFin, ${name}! Your account is now active and ready.`, 'success']
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please login with your credentials.'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed. ' + error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    // 1. Fetch user from database
    const [users] = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // 2. Validate role matches
    if (user.role !== role.toUpperCase()) {
      return res.status(401).json({
        success: false,
        message: `Incorrect role selected. This account is registered as ${user.role}.`
      });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 4. Retrieve client / staff ID if applicable
    let profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    if (user.role === 'CLIENT') {
      const [clients] = await query('SELECT id, date_of_birth, address, kyc_status FROM clients WHERE user_id = ?', [user.id]);
      if (clients && clients.length > 0) {
        profileData.client_id = clients[0].id;
        profileData.date_of_birth = clients[0].date_of_birth;
        profileData.address = clients[0].address;
        profileData.kyc_status = clients[0].kyc_status;
      }
    } else if (user.role === 'STAFF') {
      const [staff] = await query('SELECT id, employee_id, department FROM staff WHERE user_id = ?', [user.id]);
      if (staff && staff.length > 0) {
        profileData.staff_id = staff[0].id;
        profileData.employee_id = staff[0].employee_id;
        profileData.department = staff[0].department;
      }
    }

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'insurance_finance_secret_key_2026_academic_jwt',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: profileData
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const [users] = await query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    if (user.role === 'CLIENT') {
      const [clients] = await query('SELECT id, date_of_birth, address, kyc_status FROM clients WHERE user_id = ?', [user.id]);
      if (clients && clients.length > 0) {
        user.client_id = clients[0].id;
        user.date_of_birth = clients[0].date_of_birth;
        user.address = clients[0].address;
        user.kyc_status = clients[0].kyc_status;
      }
    } else if (user.role === 'STAFF') {
      const [staff] = await query('SELECT id, employee_id, department FROM staff WHERE user_id = ?', [user.id]);
      if (staff && staff.length > 0) {
        user.staff_id = staff[0].id;
        user.employee_id = staff[0].employee_id;
        user.department = staff[0].department;
      }
    }

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, address, date_of_birth } = req.body;

    if (name || phone) {
      await query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name, phone, userId]);
    }

    if (req.user.role === 'CLIENT' && (address || date_of_birth)) {
      await query('UPDATE clients SET address = COALESCE(?, address), date_of_birth = COALESCE(?, date_of_birth) WHERE user_id = ?', [address, date_of_birth, userId]);
    }

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

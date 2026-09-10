/**
 * Client Management Controller (Admin & Staff Operations)
 */

import { query } from '../config/db.js';

export async function getAllClients(req, res) {
  try {
    const { search, kyc_status } = req.query;

    let sql = `
      SELECT c.id, c.user_id, u.name, u.email, u.phone, c.date_of_birth, c.address, c.kyc_status, c.created_at
      FROM clients c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.id DESC
    `;

    const [clients] = await query(sql);

    let filtered = clients;
    if (kyc_status) {
      filtered = filtered.filter(c => c.kyc_status.toLowerCase() === kyc_status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    return res.json({ success: true, count: filtered.length, clients: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClientById(req, res) {
  try {
    const { id } = req.params;
    const [clients] = await query(
      `SELECT c.id, c.user_id, u.name, u.email, u.phone, c.date_of_birth, c.address, c.kyc_status, c.created_at
       FROM clients c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );

    if (!clients || clients.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const client = clients[0];

    // Fetch client policies, payments, and claims
    const [policies] = await query('SELECT * FROM policies WHERE client_id = ? ORDER BY id DESC', [client.id]);
    const [payments] = await query('SELECT * FROM policy_payments WHERE client_id = ? ORDER BY id DESC', [client.id]);
    const [claims] = await query('SELECT * FROM claims WHERE client_id = ? ORDER BY id DESC', [client.id]);

    return res.json({
      success: true,
      client,
      policies,
      payments,
      claims
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateKYCStatus(req, res) {
  try {
    const { id } = req.params;
    const { kyc_status } = req.body;

    if (!['Pending', 'Verified', 'Rejected'].includes(kyc_status)) {
      return res.status(400).json({ success: false, message: 'Invalid KYC status value.' });
    }

    await query('UPDATE clients SET kyc_status = ? WHERE id = ?', [kyc_status, id]);

    return res.json({ success: true, message: `KYC status updated to ${kyc_status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllStaff(req, res) {
  try {
    const sql = `
      SELECT s.id, s.user_id, s.employee_id, s.department, u.name, u.email, u.phone, s.created_at
      FROM staff s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.id ASC
    `;
    const [staff] = await query(sql);
    return res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

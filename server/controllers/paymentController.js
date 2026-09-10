/**
 * Premium Payment Controller
 * Simulates real-time digital payment (UPI, Debit Card, Net Banking),
 * records payment details in MySQL, and updates ledger transactions.
 */

import { query } from '../config/db.js';

export async function payPremium(req, res) {
  try {
    const { policy_id, amount, payment_method } = req.body;

    if (!policy_id || !amount || !payment_method) {
      return res.status(400).json({ success: false, message: 'Policy ID, amount, and payment method are required.' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Premium amount must be greater than zero.' });
    }

    // Determine client_id
    let clientId = req.user.client_id;
    if (!clientId) {
      const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (clients && clients.length > 0) clientId = clients[0].id;
    }

    // Verify policy
    const [policies] = await query('SELECT * FROM policies WHERE id = ?', [policy_id]);
    if (!policies || policies.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    const policy = policies[0];

    // Authorization check: If client, verify this is their policy
    if (req.user.role === 'CLIENT' && policy.client_id !== clientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only pay for your own policy.' });
    }

    // Generate academic transaction ID (e.g., TXN202609100001)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const transactionId = `TXN${dateStr}${randomSuffix}`;

    // 1. Insert into policy_payments
    const [paymentRes] = await query(
      `INSERT INTO policy_payments (policy_id, client_id, amount, payment_method, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [policy.id, policy.client_id, Number(amount), payment_method, transactionId, 'Paid']
    );

    // 2. Insert into transactions table for general ledger
    await query(
      `INSERT INTO transactions (transaction_type, reference_id, client_id, amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Premium',
        transactionId,
        policy.client_id,
        Number(amount),
        `Premium payment received for Policy: ${policy.policy_name} (${policy.policy_number}) via ${payment_method}`
      ]
    );

    // 3. Ensure policy is Active if it was pending
    if (policy.status === 'Pending') {
      await query('UPDATE policies SET status = ? WHERE id = ?', ['Active', policy.id]);
    }

    // 4. Create in-app notification
    await query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [
        req.user.id,
        `Payment of ₹${Number(amount).toLocaleString()} for ${policy.policy_name} was successful. Transaction Ref: ${transactionId}`,
        'success'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Payment Successful! Receipt generated.',
      receipt: {
        paymentId: paymentRes.insertId,
        transactionId,
        policyNumber: policy.policy_number,
        policyName: policy.policy_name,
        amount: Number(amount),
        paymentMethod: payment_method,
        paymentDate: new Date().toISOString(),
        status: 'Paid'
      }
    });
  } catch (error) {
    console.error('Payment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClientPayments(req, res) {
  try {
    let clientId = req.user.client_id;
    if (!clientId) {
      const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (clients && clients.length > 0) clientId = clients[0].id;
    }

    if (!clientId) {
      return res.json({ success: true, count: 0, payments: [] });
    }

    const [payments] = await query(
      `SELECT pay.*, p.policy_name, p.policy_number, p.policy_type
       FROM policy_payments pay
       JOIN policies p ON pay.policy_id = p.id
       WHERE pay.client_id = ?
       ORDER BY pay.id DESC`,
      [clientId]
    );

    return res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllPayments(req, res) {
  try {
    const { search, payment_method } = req.query;

    let sql = `
      SELECT pay.*, p.policy_name, p.policy_number, p.policy_type,
             u.name as client_name, u.email as client_email, u.phone as client_phone
      FROM policy_payments pay
      JOIN policies p ON pay.policy_id = p.id
      JOIN clients c ON pay.client_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY pay.id DESC
    `;

    const [payments] = await query(sql);

    let filtered = payments;
    if (payment_method) {
      filtered = filtered.filter(p => p.payment_method.toLowerCase() === payment_method.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.transaction_id && p.transaction_id.toLowerCase().includes(q)) ||
        (p.policy_name && p.policy_name.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: filtered.length, payments: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

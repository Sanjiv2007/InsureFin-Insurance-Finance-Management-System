/**
 * Claims Processing Controller
 * Manages claim submission, document records, staff investigations,
 * approval/rejection decisions, and claim payout transactions.
 */

import { query } from '../config/db.js';

export async function fileClaim(req, res) {
  try {
    const { policy_id, claim_type, description, claim_amount, incident_date, document_name } = req.body;

    if (!policy_id || !claim_type || !description || !claim_amount || !incident_date) {
      return res.status(400).json({ success: false, message: 'All claim details are required.' });
    }

    if (Number(claim_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Claim amount must be greater than zero.' });
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
      return res.status(404).json({ success: false, message: 'Selected policy not found.' });
    }

    const policy = policies[0];

    // Authorization check
    if (req.user.role === 'CLIENT' && policy.client_id !== clientId) {
      return res.status(403).json({ success: false, message: 'You can only file claims against your own policy.' });
    }

    // Check sum insured limit
    if (Number(claim_amount) > Number(policy.sum_insured)) {
      return res.status(400).json({
        success: false,
        message: `Claim amount (₹${Number(claim_amount).toLocaleString()}) cannot exceed the policy sum insured (₹${Number(policy.sum_insured).toLocaleString()}).`
      });
    }

    const claimNumber = `CLM-${Date.now().toString().slice(-6)}`;

    // 1. Insert Claim
    const [claimRes] = await query(
      `INSERT INTO claims (claim_number, policy_id, client_id, claim_type, description, claim_amount, incident_date, status, approved_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        claimNumber,
        policy.id,
        policy.client_id,
        claim_type,
        description,
        Number(claim_amount),
        incident_date,
        'Submitted',
        0.00
      ]
    );

    const claimId = claimRes.insertId;

    // 2. Insert Document if provided
    if (document_name) {
      await query(
        `INSERT INTO claim_documents (claim_id, document_name, document_path) VALUES (?, ?, ?)`,
        [claimId, document_name, `/uploads/claims/${claimNumber}_${document_name}`]
      );
    }

    // 3. Create Notification
    await query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [
        req.user.id,
        `Your claim ${claimNumber} for ₹${Number(claim_amount).toLocaleString()} on policy ${policy.policy_name} has been Submitted for review.`,
        'info'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Claim filed successfully. Your claim number is ' + claimNumber,
      claimId,
      claimNumber
    });
  } catch (error) {
    console.error('File Claim Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClientClaims(req, res) {
  try {
    let clientId = req.user.client_id;
    if (!clientId) {
      const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (clients && clients.length > 0) clientId = clients[0].id;
    }

    if (!clientId) {
      return res.json({ success: true, count: 0, claims: [] });
    }

    const [claims] = await query(
      `SELECT cl.*, p.policy_name, p.policy_number, p.sum_insured,
              s.employee_id as staff_emp_id, u_staff.name as staff_name
       FROM claims cl
       JOIN policies p ON cl.policy_id = p.id
       LEFT JOIN staff s ON cl.processed_by = s.id
       LEFT JOIN users u_staff ON s.user_id = u_staff.id
       WHERE cl.client_id = ?
       ORDER BY cl.id DESC`,
      [clientId]
    );

    return res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllClaims(req, res) {
  try {
    const { status, claim_type, search } = req.query;

    let sql = `
      SELECT cl.*, p.policy_name, p.policy_number, p.sum_insured,
             u_client.name as client_name, u_client.email as client_email, u_client.phone as client_phone,
             c.user_id as client_user_id,
             s.employee_id as staff_emp_id, u_staff.name as staff_name
      FROM claims cl
      JOIN policies p ON cl.policy_id = p.id
      JOIN clients c ON cl.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      LEFT JOIN staff s ON cl.processed_by = s.id
      LEFT JOIN users u_staff ON s.user_id = u_staff.id
      ORDER BY cl.id DESC
    `;

    const [claims] = await query(sql);

    let filtered = claims;
    if (status) {
      filtered = filtered.filter(cl => cl.status.toLowerCase() === status.toLowerCase());
    }
    if (claim_type) {
      filtered = filtered.filter(cl => cl.claim_type.toLowerCase() === claim_type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(cl =>
        (cl.claim_number && cl.claim_number.toLowerCase().includes(q)) ||
        (cl.policy_name && cl.policy_name.toLowerCase().includes(q)) ||
        (cl.client_name && cl.client_name.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: filtered.length, claims: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function reviewClaim(req, res) {
  try {
    const { id } = req.params;
    const { status, staff_remark, approved_amount } = req.body;

    if (!['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid claim status.' });
    }

    const [existing] = await query(
      `SELECT cl.*, c.user_id as client_user_id, p.policy_name, p.policy_number
       FROM claims cl
       JOIN clients c ON cl.client_id = c.id
       JOIN policies p ON cl.policy_id = p.id
       WHERE cl.id = ?`,
      [id]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    const claim = existing[0];
    const finalApprovedAmount = (status === 'Approved' || status === 'Settled')
      ? (Number(approved_amount) || Number(claim.claim_amount))
      : 0.00;

    const staffId = req.user.staff_id || null;

    // 1. Update claim in database
    await query(
      `UPDATE claims
       SET status = ?, staff_remark = COALESCE(?, staff_remark), approved_amount = ?, processed_by = COALESCE(?, processed_by)
       WHERE id = ?`,
      [status, staff_remark, finalApprovedAmount, staffId, id]
    );

    // 2. If approved/settled, record claim payout in transactions
    if (status === 'Approved' || status === 'Settled') {
      await query(
        `INSERT INTO transactions (transaction_type, reference_id, client_id, amount, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
          'Claim Payout',
          claim.claim_number,
          claim.client_id,
          finalApprovedAmount,
          `Claim payout processed for ${claim.claim_number} (${claim.claim_type}) on Policy ${claim.policy_name}`
        ]
      );
    }

    // 3. Notify the client
    const notifyMsg = status === 'Approved' || status === 'Settled'
      ? `Great news! Your claim ${claim.claim_number} was ${status} for ₹${finalApprovedAmount.toLocaleString()}. Remark: ${staff_remark || 'Verified and processed.'}`
      : `Your claim ${claim.claim_number} status updated to: ${status}. Remark: ${staff_remark || 'Under processing.'}`;

    await query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [claim.client_user_id, notifyMsg, (status === 'Approved' || status === 'Settled') ? 'success' : 'warning']
    );

    return res.json({
      success: true,
      message: `Claim successfully updated to ${status}.`,
      claimNumber: claim.claim_number,
      approvedAmount: finalApprovedAmount
    });
  } catch (error) {
    console.error('Review Claim Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

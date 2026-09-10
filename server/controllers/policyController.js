/**
 * Policy Management Controller
 * Handles policy catalog, client applications, staff review/approval, and admin CRUD
 */

import { query } from '../config/db.js';

// Predefined policy catalog for clients to browse and apply
export const POLICY_CATALOG = [
  {
    id: 'CAT-HLTH-01',
    policy_type: 'Health Insurance',
    policy_name: 'Comprehensive Family Health Guard',
    sum_insured: 500000,
    premium_amount: 12500,
    premium_frequency: 'Annually',
    duration_years: 1,
    description: 'Complete family hospitalization coverage including ICU, pre & post hospital care, cashless at 10,000+ network hospitals.',
    benefits: ['Cashless Treatment', 'No Claim Bonus up to 50%', 'Pre & Post Hospitalization', 'Free Annual Health Checkup']
  },
  {
    id: 'CAT-LIFE-02',
    policy_type: 'Life Insurance',
    policy_name: 'Term Life Secure Shield',
    sum_insured: 10000000,
    premium_amount: 24000,
    premium_frequency: 'Annually',
    duration_years: 10,
    description: 'High sum assured pure term protection guaranteeing financial security for your loved ones against unforeseen events.',
    benefits: ['₹1 Crore Guaranteed Cover', 'Critical Illness Rider Included', 'Tax Benefits under 80C', 'Accidental Death Benefit']
  },
  {
    id: 'CAT-MTR-03',
    policy_type: 'Motor Insurance',
    policy_name: 'Comprehensive Auto Bumper-to-Bumper',
    sum_insured: 800000,
    premium_amount: 18500,
    premium_frequency: 'Annually',
    duration_years: 1,
    description: 'Complete zero-depreciation coverage for accidental damage, third party liability, theft, natural calamities and roadside assistance.',
    benefits: ['Zero Depreciation', '24x7 Roadside Assistance', 'Engine & Gearbox Protection', 'Instant Cashless Claims']
  },
  {
    id: 'CAT-PROP-04',
    policy_type: 'Property Insurance',
    policy_name: 'Home Structure & Content Protect',
    sum_insured: 4500000,
    premium_amount: 15000,
    premium_frequency: 'Annually',
    duration_years: 1,
    description: 'Covers physical residential structure and valuable indoor assets against fire, flood, earthquake, theft and electrical breakdown.',
    benefits: ['Structure & Valuables Cover', 'Natural Calamities Protection', 'Alternative Accommodation Support', 'Fast-track Settlement']
  }
];

export async function getCatalog(req, res) {
  return res.json({ success: true, catalog: POLICY_CATALOG });
}

export async function applyPolicy(req, res) {
  try {
    const { policy_type, policy_name, sum_insured, premium_amount, premium_frequency } = req.body;

    // Get client_id of current logged-in user
    let clientId = req.user.client_id;
    if (!clientId) {
      const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (clients && clients.length > 0) {
        clientId = clients[0].id;
      } else {
        // Auto-create client entry
        const [cRes] = await query('INSERT INTO clients (user_id, kyc_status) VALUES (?, ?)', [req.user.id, 'Pending']);
        clientId = cRes.insertId;
      }
    }

    const policyNumber = `POL-${policy_type ? policy_type.substring(0, 4).toUpperCase() : 'GEN'}-${Date.now().toString().slice(-6)}`;

    // Set dates
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Pick first available staff member to assign for review
    const [staffList] = await query('SELECT id FROM staff LIMIT 1');
    const assignedStaffId = (staffList && staffList.length > 0) ? staffList[0].id : null;

    const [result] = await query(
      `INSERT INTO policies (policy_number, client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, start_date, end_date, status, assigned_staff)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        policyNumber,
        clientId,
        policy_type || 'General Insurance',
        policy_name || 'Standard Policy',
        Number(sum_insured) || 500000,
        Number(premium_amount) || 12000,
        premium_frequency || 'Annually',
        startDate,
        endDate,
        'Pending',
        assignedStaffId
      ]
    );

    // Notify client
    await query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [req.user.id, `Your application for ${policy_name} (${policyNumber}) has been submitted and is Pending review.`, 'info']
    );

    return res.status(201).json({
      success: true,
      message: 'Policy application submitted successfully! It is currently under review by our Underwriting team.',
      policyId: result.insertId,
      policyNumber
    });
  } catch (error) {
    console.error('Apply Policy Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClientPolicies(req, res) {
  try {
    let clientId = req.user.client_id;
    if (!clientId) {
      const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (clients && clients.length > 0) clientId = clients[0].id;
    }

    if (!clientId) {
      return res.json({ success: true, count: 0, policies: [] });
    }

    const [policies] = await query(
      `SELECT p.*, s.employee_id as staff_emp_id, u.name as staff_name
       FROM policies p
       LEFT JOIN staff s ON p.assigned_staff = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE p.client_id = ?
       ORDER BY p.id DESC`,
      [clientId]
    );

    return res.json({ success: true, count: policies.length, policies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllPolicies(req, res) {
  try {
    const { status, policy_type, search } = req.query;

    let sql = `
      SELECT p.*, c.user_id as client_user_id, u_client.name as client_name, u_client.email as client_email, u_client.phone as client_phone,
             s.employee_id as staff_emp_id, u_staff.name as staff_name
      FROM policies p
      JOIN clients c ON p.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      LEFT JOIN staff s ON p.assigned_staff = s.id
      LEFT JOIN users u_staff ON s.user_id = u_staff.id
      ORDER BY p.id DESC
    `;

    const [policies] = await query(sql);

    let filtered = policies;
    if (status) {
      filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (policy_type) {
      filtered = filtered.filter(p => p.policy_type.toLowerCase() === policy_type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        (p.policy_name && p.policy_name.toLowerCase().includes(q)) ||
        (p.policy_number && p.policy_number.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: filtered.length, policies: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function reviewPolicy(req, res) {
  try {
    const { id } = req.params;
    const { status, assigned_staff } = req.body;

    if (!['Pending', 'Active', 'Rejected', 'Expired', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid policy status.' });
    }

    const [existing] = await query('SELECT p.*, c.user_id FROM policies p JOIN clients c ON p.client_id = c.id WHERE p.id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Policy not found.' });
    }

    const currentPolicy = existing[0];

    await query(
      'UPDATE policies SET status = ?, assigned_staff = COALESCE(?, assigned_staff) WHERE id = ?',
      [status, assigned_staff || (req.user.staff_id || null), id]
    );

    // Notify client of review decision
    await query(
      `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
      [
        currentPolicy.user_id,
        `Your policy application (${currentPolicy.policy_number}) status has been updated to: ${status}.`,
        status === 'Active' ? 'success' : 'warning'
      ]
    );

    return res.json({
      success: true,
      message: `Policy status successfully updated to ${status}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPolicyAdmin(req, res) {
  try {
    const { client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, status, assigned_staff } = req.body;

    if (!client_id || !policy_type || !policy_name || !sum_insured || !premium_amount) {
      return res.status(400).json({ success: false, message: 'All policy details are required.' });
    }

    const policyNumber = `POL-${policy_type.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [resInsert] = await query(
      `INSERT INTO policies (policy_number, client_id, policy_type, policy_name, sum_insured, premium_amount, premium_frequency, start_date, end_date, status, assigned_staff)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        policyNumber,
        client_id,
        policy_type,
        policy_name,
        sum_insured,
        premium_amount,
        premium_frequency || 'Annually',
        startDate,
        endDate,
        status || 'Active',
        assigned_staff || null
      ]
    );

    return res.status(201).json({ success: true, message: 'Policy created successfully by Admin.', policyId: resInsert.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePolicy(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM policies WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Policy deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

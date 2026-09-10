/**
 * Dashboard Statistics Controller
 * Calculates live database statistics and summaries for Admin, Staff, and Client portals
 */

import { query } from '../config/db.js';

export async function getAdminDashboard(req, res) {
  try {
    const [allUsers] = await query('SELECT role FROM users');
    const totalUsers = allUsers.length;
    const totalClients = allUsers.filter(u => u.role === 'CLIENT').length;
    const totalStaff = allUsers.filter(u => u.role === 'STAFF').length;

    const [policies] = await query('SELECT * FROM policies ORDER BY id DESC');
    const activePolicies = policies.filter(p => p.status === 'Active').length;
    const pendingPolicies = policies.filter(p => p.status === 'Pending').length;

    const [payments] = await query('SELECT * FROM policy_payments ORDER BY id DESC');
    const totalPremiumCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const [claims] = await query('SELECT * FROM claims ORDER BY id DESC');
    const pendingClaims = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
    const approvedClaims = claims.filter(c => c.status === 'Approved' || c.status === 'Settled').length;
    const totalClaimAmount = claims.reduce((acc, c) => acc + (Number(c.approved_amount || c.claim_amount) || 0), 0);

    // Recent activities
    const recentPolicies = policies.slice(0, 5);
    const recentClaims = claims.slice(0, 5);
    const recentPayments = payments.slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalClients,
        totalStaff,
        activePolicies,
        pendingPolicies,
        totalPremiumCollected,
        pendingClaims,
        approvedClaims,
        totalClaimAmount
      },
      recent: {
        policies: recentPolicies,
        claims: recentClaims,
        payments: recentPayments
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStaffDashboard(req, res) {
  try {
    const staffId = req.user.staff_id;

    const [policies] = await query('SELECT * FROM policies ORDER BY id DESC');
    const [claims] = await query('SELECT * FROM claims ORDER BY id DESC');
    const [payments] = await query('SELECT * FROM policy_payments ORDER BY id DESC');

    const assignedPolicies = staffId ? policies.filter(p => p.assigned_staff === staffId).length : policies.length;
    const pendingReviews = policies.filter(p => p.status === 'Pending').length;
    const assignedClaims = staffId ? claims.filter(c => c.processed_by === staffId).length : claims.length;
    const claimsUnderReview = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
    const approvedClaims = claims.filter(c => c.status === 'Approved' || c.status === 'Settled').length;
    const totalPremiums = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    return res.json({
      success: true,
      stats: {
        assignedPolicies,
        pendingReviews,
        assignedClaims,
        claimsUnderReview,
        approvedClaims,
        totalPremiums
      },
      recentPolicies: policies.slice(0, 5),
      recentClaims: claims.slice(0, 5)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getClientDashboard(req, res) {
  try {
    let clientId = req.user.client_id;
    if (!clientId) {
      const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
      if (clients && clients.length > 0) clientId = clients[0].id;
    }

    if (!clientId) {
      return res.json({
        success: true,
        stats: { totalPolicies: 0, activePolicies: 0, totalPremiumPaid: 0, activeClaims: 0, approvedClaims: 0 },
        recentPolicies: [],
        recentPayments: [],
        recentClaims: []
      });
    }

    const [policies] = await query('SELECT * FROM policies WHERE client_id = ? ORDER BY id DESC', [clientId]);
    const [payments] = await query('SELECT * FROM policy_payments WHERE client_id = ? ORDER BY id DESC', [clientId]);
    const [claims] = await query('SELECT * FROM claims WHERE client_id = ? ORDER BY id DESC', [clientId]);

    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'Active').length;
    const totalPremiumPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const activeClaims = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
    const approvedClaims = claims.filter(c => c.status === 'Approved' || c.status === 'Settled').length;

    return res.json({
      success: true,
      stats: {
        totalPolicies,
        activePolicies,
        totalPremiumPaid,
        activeClaims,
        approvedClaims
      },
      recentPolicies: policies.slice(0, 4),
      recentPayments: payments.slice(0, 4),
      recentClaims: claims.slice(0, 4)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Transaction and Finance Controller
 * Provides financial ledger tracking, income & claim payout calculations, and net balance
 */

import { query } from '../config/db.js';

export async function getTransactions(req, res) {
  try {
    const { type, search } = req.query;

    let sql = `
      SELECT t.*, u.name as client_name, u.email as client_email
      FROM transactions t
      JOIN clients c ON t.client_id = c.id
      JOIN users u ON c.user_id = u.id
    `;
    const params = [];

    // Client only sees their own transactions
    if (req.user.role === 'CLIENT') {
      let clientId = req.user.client_id;
      if (!clientId) {
        const [clients] = await query('SELECT id FROM clients WHERE user_id = ?', [req.user.id]);
        if (clients && clients.length > 0) clientId = clients[0].id;
      }
      sql += ' WHERE t.client_id = ?';
      params.push(clientId || 0);
    }

    sql += ' ORDER BY t.id DESC';
    const [transactions] = await query(sql, params);

    let filtered = transactions;
    if (type) {
      filtered = filtered.filter(t => t.transaction_type.toLowerCase() === type.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.reference_id && t.reference_id.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.client_name && t.client_name.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: filtered.length, transactions: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFinancialSummary(req, res) {
  try {
    const [allTx] = await query('SELECT transaction_type, amount FROM transactions');

    let totalPremium = 0;
    let totalPayout = 0;
    let totalRefunds = 0;

    (allTx || []).forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.transaction_type === 'Premium') totalPremium += amt;
      else if (tx.transaction_type === 'Claim Payout') totalPayout += amt;
      else if (tx.transaction_type === 'Refund') totalRefunds += amt;
    });

    const netBalance = totalPremium - totalPayout - totalRefunds;

    return res.json({
      success: true,
      summary: {
        totalPremiumCollected: totalPremium,
        totalClaimPayout: totalPayout,
        totalRefunds,
        netBalance,
        totalTransactions: allTx.length
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

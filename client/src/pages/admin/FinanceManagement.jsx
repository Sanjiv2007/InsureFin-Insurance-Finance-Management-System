/**
 * Finance & Transactions Ledger View (Admin)
 * Displays total revenue, claim disbursements, net reserves, and transactions.
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

export default function FinanceManagement() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalPremiumCollected: 0, totalClaimPayout: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, [typeFilter]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      let url = '/transactions?';
      if (typeFilter) url += `type=${typeFilter}&`;

      const [txRes, sumRes] = await Promise.all([
        api.get(url),
        api.get('/transactions/summary')
      ]);

      if (txRes.data.success) setTransactions(txRes.data.transactions);
      if (sumRes.data.success) setSummary(sumRes.data.summary);
    } catch (err) {
      console.error('Error fetching finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter(t =>
    t.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Finance Ledger & Capital Reserves" />

        <div className="page-container">
          {/* Top Finance Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Premium Revenue"
              value={`₹${Number(summary.totalPremiumCollected || 0).toLocaleString()}`}
              icon={ArrowDownLeft}
              color="green"
              subtitle="Incoming premium payments"
            />
            <StatCard
              title="Total Claim Disbursements"
              value={`₹${Number(summary.totalClaimPayout || 0).toLocaleString()}`}
              icon={ArrowUpRight}
              color="red"
              subtitle="Settled claim payouts"
            />
            <StatCard
              title="Net Operating Balance"
              value={`₹${Number(summary.netBalance || 0).toLocaleString()}`}
              icon={DollarSign}
              color={summary.netBalance >= 0 ? 'blue' : 'orange'}
              subtitle="Surplus funds after payouts"
            />
          </div>

          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <h3 className="card-title">General Transaction Ledger</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search reference, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '170px' }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Premium">Premium Inflow</option>
                  <option value="Claim Payout">Claim Payout</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Type</th>
                    <th>Reference / Policy</th>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading transactions...' : 'No transactions recorded.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((t) => (
                      <tr key={t.id}>
                        <td><code>{t.reference_id}</code></td>
                        <td>
                          <span className={`badge ${t.transaction_type === 'Premium' ? 'badge-paid' : 'badge-rejected'}`}>
                            {t.transaction_type}
                          </span>
                        </td>
                        <td><strong>{t.reference_id}</strong></td>
                        <td>{t.client_name || 'General'}</td>
                        <td style={{ maxWidth: '300px' }}>{t.description}</td>
                        <td>
                          <strong style={{ color: t.transaction_type === 'Premium' ? 'var(--success)' : 'var(--danger)' }}>
                            {t.transaction_type === 'Premium' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                          </strong>
                        </td>
                        <td>{new Date(t.transaction_date || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

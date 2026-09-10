/**
 * InsureFin - Admin Dashboard View
 * Displays high-level executive KPIs, financial totals, and recent policies, claims, and payments.
 */

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldAlert, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

export default function AdminDashboard() {
  const [data, setData] = useState({ stats: {}, recent: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const { stats = {}, recent = {} } = data;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Welcome back, Admin" subtitle="InsureFin Executive Administration & Analytics Overview" />

        <div className="page-container">
          {/* Top 6 KPI Stat Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Clients"
              value={stats.totalClients ?? '...'}
              icon={UserCheck}
              color="blue"
              subtitle="Registered policyholders"
            />
            <StatCard
              title="Total Staff"
              value={stats.totalStaff ?? '...'}
              icon={ShieldAlert}
              color="purple"
              subtitle="Active underwriters"
            />
            <StatCard
              title="Active Policies"
              value={stats.activePolicies ?? '...'}
              icon={FileText}
              color="green"
              subtitle={`${stats.pendingPolicies || 0} pending review`}
            />
            <StatCard
              title="Premium Collected"
              value={`₹${(stats.totalPremiumCollected || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
              subtitle="Gross revenue inflow"
            />
            <StatCard
              title="Pending Claims"
              value={stats.pendingClaims ?? '...'}
              icon={Clock}
              color="orange"
              subtitle={`${stats.approvedClaims || 0} claims settled`}
            />
            <StatCard
              title="Claim Payouts"
              value={`₹${(stats.totalClaimAmount || 0).toLocaleString()}`}
              icon={ArrowUpRight}
              color="red"
              subtitle="Total settled disbursements"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Recent Policies */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Policy Applications</h3>
                <span className="badge badge-active">{recent.policies?.length || 0} Listed</span>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Policy No.</th>
                      <th>Client</th>
                      <th>Plan Type</th>
                      <th>Premium</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!recent.policies || recent.policies.length === 0) ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent policies</td></tr>
                    ) : (
                      recent.policies.map((p) => (
                        <tr key={p.id}>
                          <td><code>{p.policy_number}</code></td>
                          <td><strong>{p.client_name || 'Client'}</strong></td>
                          <td>{p.policy_type}</td>
                          <td>₹{Number(p.premium_amount).toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${p.status.toLowerCase().replace(' ', '-')}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Claims */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Insurance Claims</h3>
                <span className="badge badge-submitted">{recent.claims?.length || 0} Listed</span>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Claim No.</th>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Claimed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!recent.claims || recent.claims.length === 0) ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent claims</td></tr>
                    ) : (
                      recent.claims.map((c) => (
                        <tr key={c.id}>
                          <td><code>{c.claim_number}</code></td>
                          <td><strong>{c.client_name || 'Client'}</strong></td>
                          <td>{c.claim_type}</td>
                          <td>₹{Number(c.claim_amount).toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Premium Payments */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Premium Payments</h3>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Txn Reference</th>
                    <th>Client</th>
                    <th>Policy Plan</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!recent.payments || recent.payments.length === 0) ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent payments</td></tr>
                  ) : (
                    recent.payments.map((pm) => (
                      <tr key={pm.id}>
                        <td><code>{pm.transaction_id}</code></td>
                        <td><strong>{pm.client_name || 'Client'}</strong></td>
                        <td>{pm.policy_name}</td>
                        <td><strong style={{ color: 'var(--success-text)' }}>₹{Number(pm.amount).toLocaleString()}</strong></td>
                        <td><span className="badge badge-submitted">{pm.payment_method}</span></td>
                        <td><span className="badge badge-paid">{pm.status}</span></td>
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

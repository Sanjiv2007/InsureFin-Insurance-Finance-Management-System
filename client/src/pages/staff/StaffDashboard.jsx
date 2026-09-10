/**
 * InsureFin - Staff Dashboard View
 * Underwriter and Claims Officer Operations Desk
 */

import React, { useState, useEffect } from 'react';
import { FileText, Clock, FileCheck2, CheckCircle2, DollarSign, Users, Eye, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

export default function StaffDashboard() {
  const user = authService.getUser() || {};
  const [data, setData] = useState({ stats: {}, recentPolicies: [], recentClaims: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffDashboard();
  }, []);

  const fetchStaffDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/staff');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprovePolicy = async (id) => {
    try {
      const res = await api.put(`/policies/${id}/review`, { status: 'Active' });
      if (res.data.success) {
        fetchStaffDashboard();
      }
    } catch (err) {
      alert('Failed to update policy: ' + err.message);
    }
  };

  const { stats = {}, recentPolicies = [], recentClaims = [] } = data;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Welcome back, Staff" subtitle={`InsureFin Underwriting & Claims Operations Desk | Officer: ${user.name || 'Officer'}`} />

        <div className="page-container">
          {/* Top 6 KPI Stat Cards */}
          <div className="stats-grid">
            <StatCard
              title="Assigned Policies"
              value={stats.assignedPolicies ?? '...'}
              icon={FileText}
              color="blue"
              subtitle="Under active management"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews ?? '...'}
              icon={Clock}
              color="orange"
              subtitle="Awaiting underwriting review"
            />
            <StatCard
              title="Assigned Claims"
              value={stats.assignedClaims ?? '...'}
              icon={FileCheck2}
              color="purple"
              subtitle="Claims in your queue"
            />
            <StatCard
              title="Claims Under Review"
              value={stats.claimsUnderReview ?? '...'}
              icon={Clock}
              color="orange"
              subtitle="Investigation in progress"
            />
            <StatCard
              title="Approved Claims"
              value={stats.approvedClaims ?? '...'}
              icon={CheckCircle2}
              color="green"
              subtitle="Settlement confirmed"
            />
            <StatCard
              title="Premium Payments"
              value={`₹${(stats.totalPremiums || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
              subtitle="Total processed collections"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
            {/* Pending Policies */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Pending Policy Applications</h3>
                <Link to="/staff/policies" className="btn btn-secondary btn-sm">View All</Link>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Policy No.</th>
                      <th>Client</th>
                      <th>Plan</th>
                      <th>Premium</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPolicies.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No policies pending</td></tr>
                    ) : (
                      recentPolicies.map(p => (
                        <tr key={p.id}>
                          <td><code>{p.policy_number}</code></td>
                          <td><strong>{p.client_name || 'Client'}</strong></td>
                          <td>{p.policy_name}</td>
                          <td>₹{Number(p.premium_amount).toLocaleString()}</td>
                          <td><span className={`badge badge-${p.status.toLowerCase().replace(' ', '-')}`}>{p.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Link to="/staff/policies" className="btn btn-secondary btn-sm" title="Review Application">
                                Review
                              </Link>
                              {p.status === 'Pending' && (
                                <button
                                  onClick={() => handleQuickApprovePolicy(p.id)}
                                  className="btn btn-success btn-sm"
                                  title="Quick Approve"
                                  style={{ padding: '6px 8px' }}
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Claims Queue */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Assigned Claims Queue</h3>
                <Link to="/staff/claims" className="btn btn-secondary btn-sm">Process Claims</Link>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Claim No.</th>
                      <th>Client</th>
                      <th>Claim Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No claims in queue</td></tr>
                    ) : (
                      recentClaims.map(c => (
                        <tr key={c.id}>
                          <td><code>{c.claim_number}</code></td>
                          <td><strong>{c.client_name || 'Client'}</strong></td>
                          <td>{c.claim_type}</td>
                          <td><strong>₹{Number(c.claim_amount).toLocaleString()}</strong></td>
                          <td><span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span></td>
                          <td>
                            <Link to="/staff/claims" className="btn btn-secondary btn-sm">
                              Process
                            </Link>
                          </td>
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
    </div>
  );
}

/**
 * InsureFin - Client Policyholder Dashboard
 * Vibrant dashboard displaying active coverage, premium payments, and claims tracker.
 */

import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, DollarSign, FileCheck2, Search, ArrowRight, CreditCard, PlusCircle, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = authService.getUser() || {};
  const [data, setData] = useState({ stats: {}, recentPolicies: [], recentPayments: [], recentClaims: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDashboard();
  }, []);

  const fetchClientDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/client');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching client dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const { stats = {}, recentPolicies = [], recentPayments = [], recentClaims = [] } = data;

  const pendingPaymentsCount = (recentPolicies || []).filter(p => p.status === 'Pending').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title={`Welcome back, ${user.name || 'Client'}`} subtitle="InsureFin Policyholder Overview & Active Protection" />

        <div className="page-container">
          {/* Quick Action Promotional Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: 'var(--radius-xl)',
              padding: '26px 32px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              color: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.35)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                <ShieldCheck size={14} /> InsureFin Comprehensive Protection
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#ffffff' }}>
                Secure Your Health, Life, Vehicle & Home
              </h2>
              <p style={{ fontSize: '14px', color: '#e0f2fe', maxWidth: '600px' }}>
                Browse our state-of-the-art insurance plans with instant digital application, automated payments, and fast claims settlement.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 2 }}>
              <Link to="/client/browse" className="btn btn-secondary" style={{ backgroundColor: '#ffffff', color: '#1d4ed8', fontWeight: '700', borderRadius: 'var(--radius-full)' }}>
                <Search size={16} />
                <span>Browse Insurance</span>
              </Link>
              <Link to="/client/file-claim" className="btn btn-primary" style={{ background: '#1d4ed8', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 'var(--radius-full)' }}>
                <PlusCircle size={16} />
                <span>File a Claim</span>
              </Link>
            </div>
          </div>

          {/* Top 5 KPI Cards */}
          <div className="stats-grid">
            <StatCard
              title="My Policies"
              value={stats.totalPolicies ?? '...'}
              icon={FileText}
              color="blue"
              subtitle="Enrolled policies total"
            />
            <StatCard
              title="Active Policies"
              value={stats.activePolicies ?? '...'}
              icon={ShieldCheck}
              color="green"
              subtitle="Currently in force"
            />
            <StatCard
              title="Premium Paid"
              value={`₹${(stats.totalPremiumPaid || 0).toLocaleString()}`}
              icon={DollarSign}
              color="green"
              subtitle="All cumulative payments"
            />
            <StatCard
              title="Pending Payments"
              value={pendingPaymentsCount}
              icon={Clock}
              color="orange"
              subtitle="Applications pending"
            />
            <StatCard
              title="My Claims"
              value={stats.activeClaims ?? '...'}
              icon={FileCheck2}
              color="purple"
              subtitle={`${stats.approvedClaims || 0} claims settled`}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* My Recent Policies */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">My Insurance Policies</h3>
                <Link to="/client/policies" className="btn btn-secondary btn-sm">View All</Link>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Policy No.</th>
                      <th>Plan Name</th>
                      <th>Coverage</th>
                      <th>Premium</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPolicies.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No policies subscribed yet. Click 'Browse Insurance' to apply!</td></tr>
                    ) : (
                      recentPolicies.map(p => (
                        <tr key={p.id}>
                          <td><code>{p.policy_number}</code></td>
                          <td><strong>{p.policy_name}</strong></td>
                          <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                          <td><strong>₹{Number(p.premium_amount).toLocaleString()}</strong></td>
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

            {/* My Recent Claims */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">My Insurance Claims</h3>
                <Link to="/client/claims" className="btn btn-secondary btn-sm">Track Claims</Link>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Claim No.</th>
                      <th>Claim Type</th>
                      <th>Claimed</th>
                      <th>Settled</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No claims submitted</td></tr>
                    ) : (
                      recentClaims.map(c => (
                        <tr key={c.id}>
                          <td><code>{c.claim_number}</code></td>
                          <td><strong>{c.claim_type}</strong></td>
                          <td>₹{Number(c.claim_amount).toLocaleString()}</td>
                          <td>
                            <strong style={{ color: Number(c.approved_amount) > 0 ? 'var(--success-text)' : 'inherit' }}>
                              ₹{Number(c.approved_amount || 0).toLocaleString()}
                            </strong>
                          </td>
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

          {/* Recent Payments Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Recent Premium Payments</h3>
              <Link to="/client/transactions" className="btn btn-secondary btn-sm">View Ledger</Link>
            </div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Policy Plan</th>
                    <th>Amount Paid</th>
                    <th>Payment Mode</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payment transactions recorded</td></tr>
                  ) : (
                    recentPayments.map(pm => (
                      <tr key={pm.id}>
                        <td><code>{pm.transaction_id}</code></td>
                        <td><strong>{pm.policy_name}</strong></td>
                        <td><strong style={{ color: 'var(--success-text)' }}>₹{Number(pm.amount).toLocaleString()}</strong></td>
                        <td><span className="badge badge-submitted">{pm.payment_method}</span></td>
                        <td>{new Date(pm.payment_date || Date.now()).toLocaleDateString()}</td>
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

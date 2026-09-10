/**
 * Client Policies View
 * View all enrolled policies, check statuses, and launch quick payments or claims
 */

import React, { useState, useEffect } from 'react';
import { FileText, Plus, CreditCard, Shield, Clock, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function MyPolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPolicies();
  }, []);

  const fetchMyPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/policies/my-policies');
      if (res.data.success) {
        setPolicies(res.data.policies);
      }
    } catch (err) {
      console.error('Error fetching my policies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Subscribed Insurance Policies" />

        <div className="page-container">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Enrolled Policy Records</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Track your active coverage, renewal dates, and underwriter review status.
                </p>
              </div>
              <Link to="/client/browse" className="btn btn-primary">
                <Plus size={16} />
                <span>Apply for New Policy</span>
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Policy #</th>
                    <th>Plan Name</th>
                    <th>Insurance Type</th>
                    <th>Coverage (₹)</th>
                    <th>Premium (₹)</th>
                    <th>Effective Period</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                        {loading ? 'Loading your policies...' : (
                          <div>
                            <p style={{ marginBottom: '12px' }}>You have not enrolled in any insurance policies yet.</p>
                            <Link to="/client/browse" className="btn btn-primary btn-sm">Browse Catalog</Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    policies.map((p) => (
                      <tr key={p.id}>
                        <td><code>{p.policy_number}</code></td>
                        <td><strong>{p.policy_name}</strong></td>
                        <td>{p.policy_type}</td>
                        <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                        <td>
                          <div><strong>₹{Number(p.premium_amount).toLocaleString()}</strong></div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.premium_frequency}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px' }}>
                            {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'Pending'} - {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${p.status.toLowerCase().replace(' ', '-')}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {p.status === 'Active' && (
                              <>
                                <button
                                  onClick={() => navigate('/client/payments', { state: { policy: p } })}
                                  className="btn btn-success btn-sm"
                                  title="Pay Premium"
                                >
                                  <CreditCard size={14} />
                                  <span>Pay</span>
                                </button>
                                <button
                                  onClick={() => navigate('/client/file-claim', { state: { policyId: p.id } })}
                                  className="btn btn-secondary btn-sm"
                                  title="File Claim"
                                >
                                  Claim
                                </button>
                              </>
                            )}
                            {p.status === 'Pending' && (
                              <span style={{ fontSize: '11.5px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={13} /> Under Review
                              </span>
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
        </div>
      </div>
    </div>
  );
}

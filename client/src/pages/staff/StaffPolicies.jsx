/**
 * Staff Policy Review View
 * Allows staff officers to inspect applications and approve/reject them
 */

import React, { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function StaffPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Active');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let url = '/policies?';
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await api.get(url);
      if (res.data.success) {
        setPolicies(res.data.policies);
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (p) => {
    setSelectedPolicy(p);
    setReviewStatus(p.status === 'Pending' ? 'Active' : p.status);
    setError('');
    setSuccess('');
    setReviewModalOpen(true);
  };

  const handleSaveDecision = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/policies/${selectedPolicy.id}/review`, {
        status: reviewStatus
      });

      if (res.data.success) {
        setSuccess(`Policy status updated to ${reviewStatus}.`);
        fetchPolicies();
        setTimeout(() => setReviewModalOpen(false), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update policy status.');
    }
  };

  const filteredPolicies = policies.filter(p =>
    p.policy_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.policy_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Policy Applications Review Desk" />

        <div className="page-container">
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by policy #, plan, or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '180px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Applications</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Active">Active</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Policy #</th>
                    <th>Client Name</th>
                    <th>Plan Type</th>
                    <th>Coverage (₹)</th>
                    <th>Annual Premium</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading policies...' : 'No policy applications found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPolicies.map((p) => (
                      <tr key={p.id}>
                        <td><code>{p.policy_number}</code></td>
                        <td>
                          <strong>{p.client_name || 'Client'}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.client_phone}</div>
                        </td>
                        <td>{p.policy_name}</td>
                        <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                        <td><strong>₹{Number(p.premium_amount).toLocaleString()}</strong></td>
                        <td>
                          <span className={`badge badge-${p.status.toLowerCase().replace(' ', '-')}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenReview(p)}
                            className="btn btn-secondary btn-sm"
                          >
                            Review & Decide
                          </button>
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

      {/* Policy Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Underwriting Review: ${selectedPolicy?.policy_number || ''}`}
      >
        {selectedPolicy && (
          <form onSubmit={handleSaveDecision}>
            {error && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '18px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><strong>Client Name:</strong> {selectedPolicy.client_name}</div>
                <div><strong>Client Email:</strong> {selectedPolicy.client_email}</div>
                <div><strong>Policy Plan:</strong> {selectedPolicy.policy_name}</div>
                <div><strong>Policy Type:</strong> {selectedPolicy.policy_type}</div>
                <div><strong>Sum Insured:</strong> ₹{Number(selectedPolicy.sum_insured).toLocaleString()}</div>
                <div><strong>Premium Due:</strong> ₹{Number(selectedPolicy.premium_amount).toLocaleString()}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Underwriting Decision *</label>
              <select
                className="form-control"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                required
              >
                <option value="Active">Approve & Activate Policy</option>
                <option value="Rejected">Reject Policy Application</option>
                <option value="Pending">Keep in Pending</option>
              </select>
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
              <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Decision</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

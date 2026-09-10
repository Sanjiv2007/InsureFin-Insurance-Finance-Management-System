/**
 * Staff Claims Processing Desk
 * Inspect descriptions, supporting documents, recommend settlement, and record decisions
 */

import React, { useState, useEffect } from 'react';
import { FileCheck2, Search, CheckCircle, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function StaffClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState('Approved');
  const [staffRemark, setStaffRemark] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let url = '/claims?';
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await api.get(url);
      if (res.data.success) {
        setClaims(res.data.claims);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (c) => {
    setSelectedClaim(c);
    setDecision(c.status === 'Submitted' ? 'Approved' : c.status);
    setStaffRemark(c.staff_remark || '');
    setApprovedAmount(c.approved_amount || c.claim_amount);
    setError('');
    setSuccess('');
    setReviewModalOpen(true);
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/claims/${selectedClaim.id}/review`, {
        status: decision,
        staff_remark: staffRemark,
        approved_amount: approvedAmount
      });

      if (res.data.success) {
        setSuccess(`Claim updated to ${decision}.`);
        fetchClaims();
        setTimeout(() => setReviewModalOpen(false), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update claim.');
    }
  };

  const filteredClaims = claims.filter(c =>
    c.claim_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.policy_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Claims Investigation & Processing Desk" />

        <div className="page-container">
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by claim #, policy, or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '180px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Claims</option>
                  <option value="Submitted">Submitted (New)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Settled">Settled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Claim #</th>
                    <th>Customer Name</th>
                    <th>Policy Plan</th>
                    <th>Claim Type</th>
                    <th>Claimed Amount</th>
                    <th>Settled</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading claims queue...' : 'No claims found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((c) => (
                      <tr key={c.id}>
                        <td><code>{c.claim_number}</code></td>
                        <td>
                          <strong>{c.client_name || 'Client'}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.client_phone}</div>
                        </td>
                        <td>{c.policy_name}</td>
                        <td>{c.claim_type}</td>
                        <td><strong>₹{Number(c.claim_amount).toLocaleString()}</strong></td>
                        <td>
                          <strong style={{ color: Number(c.approved_amount) > 0 ? 'var(--success)' : 'inherit' }}>
                            ₹{Number(c.approved_amount || 0).toLocaleString()}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenReview(c)}
                            className="btn btn-secondary btn-sm"
                          >
                            Process
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

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Claim Adjudication: ${selectedClaim?.claim_number || ''}`}
        maxWidth="650px"
      >
        {selectedClaim && (
          <form onSubmit={handleSubmitDecision}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div><strong>Client:</strong> {selectedClaim.client_name}</div>
                <div><strong>Policy Plan:</strong> {selectedClaim.policy_name}</div>
                <div><strong>Claimed:</strong> ₹{Number(selectedClaim.claim_amount).toLocaleString()}</div>
                <div><strong>Incident Date:</strong> {new Date(selectedClaim.incident_date).toLocaleDateString()}</div>
              </div>
              <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <strong>Claim Description:</strong>
                <p style={{ marginTop: '4px' }}>{selectedClaim.description}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Review Decision *</label>
                <select
                  className="form-control"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  required
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Settled">Settled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {(decision === 'Approved' || decision === 'Settled') && (
                <div className="form-group">
                  <label className="form-label">Approved Settlement Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Staff Remarks & Reason for Decision</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Enter surveyor findings, hospital verification, or notes..."
                value={staffRemark}
                onChange={(e) => setStaffRemark(e.target.value)}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
              <button type="button" onClick={() => setReviewModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Decision</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

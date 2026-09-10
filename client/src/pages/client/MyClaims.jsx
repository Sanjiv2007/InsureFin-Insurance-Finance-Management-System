/**
 * My Claims Tracker View (Client)
 * Real-time tracker for filed claims, staff remarks, and approved settlement payouts
 */

import React, { useState, useEffect } from 'react';
import { FileCheck2, PlusCircle, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/claims/my-claims');
      if (res.data.success) {
        setClaims(res.data.claims);
      }
    } catch (err) {
      console.error('Error fetching my claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (c) => {
    setSelectedClaim(c);
    setModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Insurance Claims Status" />

        <div className="page-container">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Claims Adjudication Tracker</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Monitor the real-time status of your claims and underwriting remarks.
                </p>
              </div>
              <Link to="/client/file-claim" className="btn btn-primary">
                <PlusCircle size={16} />
                <span>File New Claim</span>
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Claim #</th>
                    <th>Policy Subscribed</th>
                    <th>Claim Type</th>
                    <th>Claimed Amount</th>
                    <th>Settled Amount</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                        {loading ? 'Loading claims tracker...' : (
                          <div>
                            <p style={{ marginBottom: '12px' }}>You have not submitted any insurance claims.</p>
                            <Link to="/client/file-claim" className="btn btn-primary btn-sm">File a Claim</Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    claims.map((c) => (
                      <tr key={c.id}>
                        <td><code>{c.claim_number}</code></td>
                        <td>
                          <div><strong>{c.policy_name}</strong></div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.policy_number}</span>
                        </td>
                        <td>{c.claim_type}</td>
                        <td>₹{Number(c.claim_amount).toLocaleString()}</td>
                        <td>
                          <strong style={{ color: Number(c.approved_amount) > 0 ? 'var(--success)' : 'inherit' }}>
                            ₹{Number(c.approved_amount || 0).toLocaleString()}
                          </strong>
                        </td>
                        <td>{new Date(c.submitted_date || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${c.status.toLowerCase().replace(' ', '-')}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenDetails(c)}
                            className="btn btn-secondary btn-sm"
                          >
                            View
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

      {/* Claim Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Claim Record: ${selectedClaim?.claim_number || ''}`}
      >
        {selectedClaim && (
          <div>
            <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div><strong>Policy Plan:</strong> {selectedClaim.policy_name}</div>
                <div><strong>Claim Type:</strong> {selectedClaim.claim_type}</div>
                <div><strong>Date of Incident:</strong> {new Date(selectedClaim.incident_date).toLocaleDateString()}</div>
                <div><strong>Claimed:</strong> ₹{Number(selectedClaim.claim_amount).toLocaleString()}</div>
                <div><strong>Settled Amount:</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹{Number(selectedClaim.approved_amount || 0).toLocaleString()}</span></div>
                <div><strong>Current Status:</strong> <span className={`badge badge-${selectedClaim.status.toLowerCase().replace(' ', '-')}`}>{selectedClaim.status}</span></div>
              </div>

              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <strong>Incident Description:</strong>
                <p style={{ marginTop: '4px' }}>{selectedClaim.description}</p>
              </div>
            </div>

            {/* Staff Remarks */}
            <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
                Officer Remark & Assessment:
              </strong>
              <p style={{ fontSize: '13px' }}>
                {selectedClaim.staff_remark || 'Your claim has been registered and is assigned to the Claims Desk for review.'}
              </p>
            </div>

            <div className="modal-footer" style={{ padding: '10px 0 0' }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-primary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

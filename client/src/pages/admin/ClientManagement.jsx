/**
 * Client Management View (Admin / Staff)
 * Shows policyholders, KYC status verification, and full profile inspection
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Eye, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [kycFilter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      let url = '/clients';
      if (kycFilter) url += `?kyc_status=${kycFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setClients(res.data.clients);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (client) => {
    setSelectedClient(client);
    setDetailModalOpen(true);
    try {
      const res = await api.get(`/clients/${client.id}`);
      if (res.data.success) {
        setClientDetails(res.data);
      }
    } catch (err) {
      console.error('Error fetching client details:', err);
    }
  };

  const handleUpdateKYC = async (clientId, newStatus) => {
    try {
      const res = await api.put(`/clients/${clientId}/kyc`, { kyc_status: newStatus });
      if (res.data.success) {
        fetchClients();
        if (selectedClient && selectedClient.id === clientId) {
          handleViewDetails({ ...selectedClient, kyc_status: newStatus });
        }
      }
    } catch (err) {
      alert('Failed to update KYC: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Client & Customer Records" />

        <div className="page-container">
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search client by name, email, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '180px' }}
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                >
                  <option value="">All KYC Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>KYC Status</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading client records...' : 'No client records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((c) => (
                      <tr key={c.id}>
                        <td>#CL-{c.id}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>
                          <span className={`badge badge-${c.kyc_status.toLowerCase()}`}>
                            {c.kyc_status}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.address || 'N/A'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleViewDetails(c)}
                              className="btn btn-secondary btn-sm"
                              title="View Full Profile"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                            {c.kyc_status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateKYC(c.id, 'Verified')}
                                className="btn btn-success btn-sm"
                                title="Approve KYC"
                              >
                                <CheckCircle size={14} />
                                <span>Verify</span>
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
        </div>
      </div>

      {/* Client Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Client Dossier: ${selectedClient?.name || ''}`}
        maxWidth="750px"
      >
        {selectedClient && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Email:</span>
                <p style={{ fontWeight: '600' }}>{selectedClient.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Phone:</span>
                <p style={{ fontWeight: '600' }}>{selectedClient.phone}</p>
              </div>
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>KYC Status:</span>
                <div style={{ marginTop: '2px' }}>
                  <span className={`badge badge-${selectedClient.kyc_status?.toLowerCase()}`}>{selectedClient.kyc_status}</span>
                </div>
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Address:</span>
                <p>{selectedClient.address || 'Not provided'}</p>
              </div>
            </div>

            {/* Change KYC Status Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Update KYC:</span>
              <button onClick={() => handleUpdateKYC(selectedClient.id, 'Verified')} className="btn btn-success btn-sm">Mark Verified</button>
              <button onClick={() => handleUpdateKYC(selectedClient.id, 'Rejected')} className="btn btn-danger btn-sm">Mark Rejected</button>
              <button onClick={() => handleUpdateKYC(selectedClient.id, 'Pending')} className="btn btn-secondary btn-sm">Set Pending</button>
            </div>

            {/* Policies Held */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Active & Subscribed Policies</h4>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Policy No.</th>
                    <th>Policy Plan</th>
                    <th>Coverage</th>
                    <th>Premium</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!clientDetails?.policies || clientDetails.policies.length === 0) ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No policies subscribed yet</td></tr>
                  ) : (
                    clientDetails.policies.map(p => (
                      <tr key={p.id}>
                        <td><code>{p.policy_number}</code></td>
                        <td>{p.policy_name}</td>
                        <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                        <td>₹{Number(p.premium_amount).toLocaleString()}</td>
                        <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Claims History */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Claims History</h4>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Claim No.</th>
                    <th>Type</th>
                    <th>Claimed Amount</th>
                    <th>Settled</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(!clientDetails?.claims || clientDetails.claims.length === 0) ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No claims filed</td></tr>
                  ) : (
                    clientDetails.claims.map(c => (
                      <tr key={c.id}>
                        <td><code>{c.claim_number}</code></td>
                        <td>{c.claim_type}</td>
                        <td>₹{Number(c.claim_amount).toLocaleString()}</td>
                        <td>₹{Number(c.approved_amount || 0).toLocaleString()}</td>
                        <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

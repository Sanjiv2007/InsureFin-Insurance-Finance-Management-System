/**
 * Staff Customer Records View
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Eye, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function StaffClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients');
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

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Assigned Customer Records" />

        <div className="page-container">
          <div className="card">
            <div className="card-header">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: '360px' }}
                placeholder="Search customer by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client ID</th>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>KYC Status</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading customers...' : 'No customers found.'}
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
                        <td>{c.address || 'N/A'}</td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(c)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Eye size={14} />
                            <span>Dossier</span>
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

      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Customer Dossier: ${selectedClient?.name || ''}`}
        maxWidth="700px"
      >
        {selectedClient && (
          <div>
            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <p><strong>Email:</strong> {selectedClient.email} | <strong>Phone:</strong> {selectedClient.phone}</p>
              <p style={{ marginTop: '4px' }}><strong>Address:</strong> {selectedClient.address || 'Not provided'}</p>
              <p style={{ marginTop: '4px' }}><strong>KYC Status:</strong> <span className={`badge badge-${selectedClient.kyc_status?.toLowerCase()}`}>{selectedClient.kyc_status}</span></p>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Subscribed Policies</h4>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Policy No.</th>
                  <th>Plan</th>
                  <th>Coverage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!clientDetails?.policies || clientDetails.policies.length === 0) ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No policies active</td></tr>
                ) : (
                  clientDetails.policies.map(p => (
                    <tr key={p.id}>
                      <td><code>{p.policy_number}</code></td>
                      <td>{p.policy_name}</td>
                      <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                      <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}

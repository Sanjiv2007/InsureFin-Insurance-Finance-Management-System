/**
 * Policy Management View (Admin)
 * View, filter, approve, reject, create, and manage all insurance policies
 */

import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, CheckCircle, XCircle, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function PolicyManagement() {
  const [policies, setPolicies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    policy_type: 'Health Insurance',
    policy_name: '',
    sum_insured: '',
    premium_amount: '',
    premium_frequency: 'Annually',
    status: 'Active'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPolicies();
    fetchClients();
  }, [statusFilter, typeFilter]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      let url = '/policies?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `policy_type=${typeFilter}&`;
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

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      if (res.data.success) {
        setClients(res.data.clients);
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateStatus = async (policyId, status) => {
    try {
      const res = await api.put(`/policies/${policyId}/review`, { status });
      if (res.data.success) {
        fetchPolicies();
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      const res = await api.delete(`/policies/${id}`);
      if (res.data.success) {
        fetchPolicies();
      }
    } catch (err) {
      alert('Failed to delete policy.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/policies', formData);
      if (res.data.success) {
        setSuccess('Policy created successfully.');
        fetchPolicies();
        setTimeout(() => setCreateModalOpen(false), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create policy.');
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
        <Navbar title="Insurance Policy Management" />

        <div className="page-container">
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ minWidth: '220px', flex: 1 }}
                  placeholder="Search by policy #, plan, or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '160px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <select
                  className="form-control"
                  style={{ width: '180px' }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Insurance Types</option>
                  <option value="Health Insurance">Health</option>
                  <option value="Life Insurance">Life</option>
                  <option value="Motor Insurance">Motor</option>
                  <option value="Property Insurance">Property</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFormData({
                    client_id: clients[0]?.id || '',
                    policy_type: 'Health Insurance',
                    policy_name: '',
                    sum_insured: '',
                    premium_amount: '',
                    premium_frequency: 'Annually',
                    status: 'Active'
                  });
                  setError('');
                  setSuccess('');
                  setCreateModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Issue New Policy</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Policy No.</th>
                    <th>Client Name</th>
                    <th>Type & Plan</th>
                    <th>Sum Insured</th>
                    <th>Premium</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading policies...' : 'No policies found.'}
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
                        <td>
                          <div><strong>{p.policy_name}</strong></div>
                          <span style={{ fontSize: '11.5px', color: 'var(--primary)' }}>{p.policy_type}</span>
                        </td>
                        <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                        <td>
                          <div><strong>₹{Number(p.premium_amount).toLocaleString()}</strong></div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.premium_frequency}</span>
                        </td>
                        <td>
                          <span className={`badge badge-${p.status.toLowerCase().replace(' ', '-')}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {p.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(p.id, 'Active')}
                                  className="btn btn-success btn-sm"
                                  title="Approve Policy"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(p.id, 'Rejected')}
                                  className="btn btn-danger btn-sm"
                                  title="Reject Policy"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                            {p.status === 'Active' && (
                              <button
                                onClick={() => handleUpdateStatus(p.id, 'Cancelled')}
                                className="btn btn-secondary btn-sm"
                                title="Cancel Policy"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="btn btn-danger btn-sm"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
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

      {/* Create Policy Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Issue New Insurance Policy"
      >
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

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Select Client *</label>
            <select
              className="form-control"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Policy Type *</label>
              <select
                className="form-control"
                value={formData.policy_type}
                onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
              >
                <option value="Health Insurance">Health Insurance</option>
                <option value="Life Insurance">Life Insurance</option>
                <option value="Motor Insurance">Motor Insurance</option>
                <option value="Property Insurance">Property Insurance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Policy Plan Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Platinum Health Guard"
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Sum Insured (Coverage ₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="500000"
                value={formData.sum_insured}
                onChange={(e) => setFormData({ ...formData, sum_insured: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Premium Amount (₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="12000"
                value={formData.premium_amount}
                onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Premium Frequency</label>
              <select
                className="form-control"
                value={formData.premium_frequency}
                onChange={(e) => setFormData({ ...formData, premium_frequency: e.target.value })}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Policy</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

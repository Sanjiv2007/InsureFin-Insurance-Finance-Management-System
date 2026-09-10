/**
 * Staff Management View (Admin)
 * Manage claims officers, underwriters, and department assignments
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Search, Mail, Phone, Building, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    employee_id: '',
    department: 'Underwriting & Claims'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients/staff-list');
      if (res.data.success) {
        setStaff(res.data.staff);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/users', {
        ...formData,
        role: 'STAFF'
      });
      if (res.data.success) {
        setSuccess('Staff officer registered successfully.');
        fetchStaff();
        setTimeout(() => setModalOpen(false), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff officer.');
    }
  };

  const filteredStaff = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Staff & Underwriter Management" />

        <div className="page-container">
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search staff by name, ID, or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  setFormData({ name: '', email: '', phone: '', password: '', employee_id: '', department: 'Underwriting & Claims' });
                  setError('');
                  setSuccess('');
                  setModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Add Staff Member</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Officer Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading staff list...' : 'No staff members registered.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.employee_id}</strong></td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
                            <Building size={14} color="var(--primary)" />
                            {s.department}
                          </span>
                        </td>
                        <td><span className="badge badge-active">Active Officer</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Insurance Staff Member"
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ananya Verma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="staff@insurance.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                className="form-control"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="EMP-1005"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Underwriting & Claims">Underwriting & Claims</option>
                <option value="Policy Verification">Policy Verification</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Risk & Actuarial">Risk & Actuarial</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Login Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min. 6 chars"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Staff Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

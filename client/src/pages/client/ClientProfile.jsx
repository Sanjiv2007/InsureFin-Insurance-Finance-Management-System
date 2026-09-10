/**
 * InsureFin - Modern Profile View
 * Inspired by modern dashboard profiles with hero banner, avatar,
 * personal details, role-specific attributes, KYC verification, and editing.
 */

import React, { useState, useEffect } from 'react';
import { User, Shield, Phone, Mail, MapPin, Calendar, CheckCircle2, AlertCircle, Edit3, Building, Award, Globe } from 'lucide-react';
import api, { authService } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../utils/countries';

export default function ClientProfile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    date_of_birth: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setProfile(res.data.user);
        setFormData({
          name: res.data.user.name || '',
          phone: res.data.user.phone || '',
          address: res.data.user.address || '',
          date_of_birth: res.data.user.date_of_birth ? res.data.user.date_of_birth.split('T')[0] : ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        setSuccess('Profile details updated successfully!');
        fetchProfile();
        // update cached local user name if changed
        const currentCached = authService.getUser();
        if (currentCached) {
          authService.setUser({ ...currentCached, name: formData.name, phone: formData.phone });
        }
        setTimeout(() => setEditModalOpen(false), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const role = profile.role || 'CLIENT';
  const firstLetter = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My InsureFin Profile" subtitle="Manage your personal information, contact credentials and verification status" />

        <div className="page-container">
          {/* Top Profile Hero Card */}
          <div className="profile-hero-card">
            <div className="profile-avatar-large">
              {firstLetter}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                  {profile.name || 'User Profile'}
                </h1>
                <span className={`role-tag ${role.toLowerCase()}`} style={{ fontSize: '12px', padding: '4px 12px' }}>
                  {role} Account
                </span>
                {role === 'CLIENT' && (
                  <span className={`badge badge-${(profile.kyc_status || 'Pending').toLowerCase()}`} style={{ fontSize: '12px' }}>
                    KYC {profile.kyc_status || 'Pending'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13.5px', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={16} color="#60a5fa" />
                  <span>{profile.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} color="#60a5fa" />
                  <span>{profile.phone}</span>
                </div>
                {profile.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="#60a5fa" />
                    <span>{profile.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setEditModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ borderRadius: 'var(--radius-full)', padding: '10px 22px' }}
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Personal Details Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="var(--primary)" />
                  <span>Personal Details</span>
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Full Legal Name:</span>
                  <strong>{profile.name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Registered Email:</span>
                  <strong>{profile.email}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span>
                  <strong>{profile.phone}</strong>
                </div>

                {role === 'CLIENT' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Date of Birth:</span>
                    <strong>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not specified'}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account Created:</span>
                  <strong>{new Date(profile.created_at || Date.now()).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            {/* Role & Specific Identifiers */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="var(--primary)" />
                  <span>{role === 'CLIENT' ? 'KYC & Insurance Profile' : (role === 'STAFF' ? 'Department & Staff Details' : 'Administrator Credentials')}</span>
                </h3>
              </div>

              {role === 'CLIENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>KYC Verification Status:</span>
                    <span className={`badge badge-${(profile.kyc_status || 'Pending').toLowerCase()}`}>
                      {profile.kyc_status || 'Pending'}
                    </span>
                  </div>

                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Residential Address:</span>
                    <strong>{profile.address || 'Address not provided'}</strong>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-text)', fontWeight: '700', marginBottom: '4px' }}>
                      <CheckCircle2 size={16} color="var(--success)" />
                      <span>Digital Policyholder Protection</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Your InsureFin account is configured with real-time claims tracking, automated premium invoicing, and digital receipts.
                    </p>
                  </div>
                </div>
              )}

              {role === 'STAFF' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Employee ID:</span>
                    <strong>{profile.employee_id || 'EMP-1001'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Assigned Department:</span>
                    <strong>{profile.department || 'Underwriting & Claims'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>System Authority:</span>
                    <span className="badge badge-active">Underwriter Officer</span>
                  </div>
                </div>
              )}

              {role === 'ADMIN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Admin System Level:</span>
                    <strong>Super Administrator</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Security Clearance:</span>
                    <span className="badge badge-active">Full System Root Access</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Audit Logging:</span>
                    <span className="badge badge-paid">Enabled & Encrypted</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile Information"
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

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Full Legal Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {role === 'CLIENT' && (
            <>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, Pincode"
                />
              </div>
            </>
          )}

          <div className="modal-footer" style={{ padding: '16px 0 0', marginTop: '16px' }}>
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

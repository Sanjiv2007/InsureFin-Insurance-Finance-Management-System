/**
 * InsureFin - Modern Registration Page
 * Supports Country selection with automatic country calling code sync,
 * role-specific sections, clean validation, and bcrypt password hashing.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, UserPlus, AlertCircle, CheckCircle2, Globe, Phone, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { COUNTRIES, DEFAULT_COUNTRY } from '../utils/countries';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('CLIENT');

  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [phoneRaw, setPhoneRaw] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Client fields
    date_of_birth: '',
    address: '',
    // Staff fields
    employee_id: '',
    department: 'Underwriting & Claims',
    // Admin fields
    admin_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (e) => {
    const countryObj = COUNTRIES.find(c => c.code === e.target.value) || DEFAULT_COUNTRY;
    setSelectedCountry(countryObj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !phoneRaw || !formData.password) {
      setError('Please fill all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    // Combine calling code and raw phone number
    const fullPhone = `${selectedCountry.dialCode} ${phoneRaw.trim()}`;

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        country: selectedCountry.name,
        phone: fullPhone,
        password: formData.password,
        role,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        employee_id: formData.employee_id || formData.admin_id,
        department: formData.department
      };

      const res = await api.post('/auth/register', payload);

      if (res.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1400);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '48px 20px' }}>
      <div className="auth-card" style={{ maxWidth: '640px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Shield size={30} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Create Your InsureFin Account
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Register as a Client, Staff Member or Administrator
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'CLIENT' ? 'active' : ''}`}
            onClick={() => setRole('CLIENT')}
          >
            Client Registration
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'STAFF' ? 'active' : ''}`}
            onClick={() => setRole('STAFF')}
          >
            Staff Registration
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setRole('ADMIN')}
          >
            Admin Registration
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Country and Phone Number with Automatic Calling Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Country *</label>
              <select
                className="form-control"
                value={selectedCountry.code}
                onChange={handleCountryChange}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div
                  style={{
                    padding: '11px 12px',
                    background: '#f1f5f9',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '80px',
                    justifyContent: 'center'
                  }}
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </div>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="9876543210"
                  value={phoneRaw}
                  onChange={(e) => setPhoneRaw(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Role Specific Fields */}
          {role === 'CLIENT' && (
            <>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  rows="2"
                  placeholder="Street, City, State, Pincode"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {role === 'STAFF' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  name="employee_id"
                  className="form-control"
                  placeholder="e.g. EMP-2045"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Underwriting & Claims">Underwriting & Claims</option>
                  <option value="Policy Verification">Policy Verification</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Risk & Actuarial">Risk & Actuarial</option>
                </select>
              </div>
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="form-group">
              <label className="form-label">Admin Security Reference ID *</label>
              <input
                type="text"
                name="admin_id"
                className="form-control"
                placeholder="e.g. ADM-001"
                value={formData.admin_id}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min. 6 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-type password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              role === 'CLIENT' ? 'Create Client Account' :
              role === 'STAFF' ? 'Create Staff Account' : 'Create Admin Account'
            )}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            Sign In to InsureFin
          </Link>
        </div>
      </div>
    </div>
  );
}

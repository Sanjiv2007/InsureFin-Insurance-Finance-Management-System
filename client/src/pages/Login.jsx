/**
 * InsureFin - Modern Login Screen
 * Vibrant split-screen design with role selector, feature highlights, and authentication.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, CreditCard, FileCheck } from 'lucide-react';
import api, { authService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
        role
      });

      if (res.data.success) {
        authService.setUser(res.data.user, res.data.token);

        // Redirect according to authenticated role
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else if (res.data.user.role === 'STAFF') {
          navigate('/staff/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email, password, or role selected.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'ADMIN') {
      setEmail('admin@gmail.com');
      setPassword('123456');
    } else if (demoRole === 'STAFF') {
      setEmail('staff@gmail.com');
      setPassword('123456');
    } else {
      setEmail('rahul@gmail.com');
      setPassword('123456');
    }
  };

  return (
    <div className="auth-page">
      <div className="login-split-container">
        {/* LEFT HERO SIDE */}
        <div className="login-hero-side">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 18px rgba(59, 130, 246, 0.5)'
                }}
              >
                <Shield size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>InsureFin</h1>
                <p style={{ fontSize: '12px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                  Insurance & Finance System
                </p>
              </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '1.3', marginBottom: '14px', color: '#f8fafc' }}>
              Simple. Secure. Smarter Insurance Management.
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '32px' }}>
              A unified platform to streamline policy underwriting, automated digital premium payments, and end-to-end claim adjudication.
            </p>

            {/* 3 Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="#60a5fa" />
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#f1f5f9' }}>✓ Insurance Policy Management</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} color="#34d399" />
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#f1f5f9' }}>✓ Digital Premium Payments</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileCheck size={18} color="#c084fc" />
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#f1f5f9' }}>✓ Online Claim Tracking & Review</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '12px', color: '#94a3b8' }}>
            Academic Full Stack Development Project © {new Date().getFullYear()} InsureFin
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="login-form-side">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Sign in to your account with your credentials
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="form-group">
            <label className="form-label">Select Your Role</label>
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${role === 'CLIENT' ? 'active' : ''}`}
                onClick={() => setRole('CLIENT')}
              >
                Client
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'STAFF' ? 'active' : ''}`}
                onClick={() => setRole('STAFF')}
              >
                Staff
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setRole('ADMIN')}
              >
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', marginTop: '6px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : `Login as ${role}`}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Helper */}
      {forgotOpen && (
        <div className="modal-overlay" onClick={() => setForgotOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Forgot Password</h3>
              <button onClick={() => setForgotOpen(false)} className="btn btn-secondary btn-sm">✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                For academic demonstration, demo accounts use password <strong>123456</strong>. If you registered a custom account, you can register a new account anytime on the registration page.
              </p>
              <div className="modal-footer" style={{ padding: '12px 0 0' }}>
                <button onClick={() => setForgotOpen(false)} className="btn btn-primary">Understood</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * InsureFin - Browse & Apply for Insurance Policies View
 * Modern catalog with category icons, coverage summary, duration, and 1-click application.
 */

import React, { useState, useEffect } from 'react';
import { HeartPulse, Shield, Car, Home, CheckCircle2, ArrowRight, AlertCircle, Info, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function BrowseInsurance() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const typeIconMap = {
    'Health Insurance': HeartPulse,
    'Life Insurance': Shield,
    'Motor Insurance': Car,
    'Property Insurance': Home
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/policies/catalog');
      if (res.data.success) {
        setCatalog(res.data.catalog);
      }
    } catch (err) {
      console.error('Error fetching policy catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (plan) => {
    setSelectedPlan(plan);
    setDetailsModalOpen(true);
  };

  const handleOpenApply = (plan) => {
    setSelectedPlan(plan);
    setError('');
    setSuccess('');
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const res = await api.post('/policies/apply', {
        policy_type: selectedPlan.policy_type,
        policy_name: selectedPlan.policy_name,
        sum_insured: selectedPlan.sum_insured,
        premium_amount: selectedPlan.premium_amount,
        premium_frequency: selectedPlan.premium_frequency
      });

      if (res.data.success) {
        setSuccess('Policy application submitted! Underwriting review in progress.');
        setTimeout(() => {
          setApplyModalOpen(false);
          navigate('/client/policies');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Browse Insurance Plans" subtitle="Select from our tailored portfolios for comprehensive health, life, auto and home protection" />

        <div className="page-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {catalog.map((plan) => {
              const Icon = typeIconMap[plan.policy_type] || Shield;
              return (
                <div
                  key={plan.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    borderTop: '4px solid var(--primary)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={26} />
                      </div>
                      <span className="badge badge-active">{plan.policy_type}</span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      {plan.policy_name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '38px', lineHeight: '1.5' }}>
                      {plan.description}
                    </p>

                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Coverage (Sum Insured):</span>
                        <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>₹{Number(plan.sum_insured).toLocaleString()}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Premium:</span>
                        <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>₹{Number(plan.premium_amount).toLocaleString()}/yr</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--primary)" /> Term Duration:
                        </span>
                        <span>{plan.duration_years || 1} Year{plan.duration_years > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Key Included Benefits:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {plan.benefits.map((b, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0 }} />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleOpenDetails(plan)}
                      className="btn btn-secondary"
                      style={{ padding: '10px' }}
                    >
                      <Info size={15} />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleOpenApply(plan)}
                      className="btn btn-primary"
                      style={{ padding: '10px' }}
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedPlan?.policy_name || 'Policy Specifications'}
      >
        {selectedPlan && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span className="badge badge-active">{selectedPlan.policy_type}</span>
              <span className="badge badge-submitted">{selectedPlan.duration_years || 1} Year Term</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
              {selectedPlan.description}
            </p>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div><strong>Sum Insured:</strong> ₹{Number(selectedPlan.sum_insured).toLocaleString()}</div>
                <div><strong>Annual Premium:</strong> ₹{Number(selectedPlan.premium_amount).toLocaleString()}</div>
                <div><strong>Billing Cycle:</strong> {selectedPlan.premium_frequency}</div>
                <div><strong>Cashless Network:</strong> 10,000+ Providers</div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button onClick={() => setDetailsModalOpen(false)} className="btn btn-secondary">Close</button>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleOpenApply(selectedPlan);
                }}
                className="btn btn-primary"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Application Confirmation Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Confirm InsureFin Policy Application"
      >
        {selectedPlan && (
          <form onSubmit={handleConfirmApply}>
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

            <div style={{ padding: '18px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
                {selectedPlan.policy_name}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {selectedPlan.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <div><strong>Sum Insured:</strong> ₹{Number(selectedPlan.sum_insured).toLocaleString()}</div>
                <div><strong>Annual Premium:</strong> ₹{Number(selectedPlan.premium_amount).toLocaleString()}</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              ℹ️ Upon confirmation, your application will be registered as <strong style={{ color: 'var(--warning-text)' }}>Pending</strong> and assigned to our Underwriting Desk for verification.
            </p>

            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" onClick={() => setApplyModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting Application...' : 'Confirm Application'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

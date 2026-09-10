/**
 * File an Insurance Claim View (Client)
 * Allows policyholders to submit new claim requests with incident reports and bills
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilePlus2, AlertCircle, CheckCircle2, UploadCloud, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function FileClaim() {
  const location = useLocation();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [formData, setFormData] = useState({
    policy_id: '',
    claim_type: 'Medical Hospitalization',
    incident_date: new Date().toISOString().split('T')[0],
    claim_amount: '',
    description: '',
    document_name: 'medical_discharge_summary.pdf'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies/my-policies');
      if (res.data.success) {
        // Filter only Active policies for claims
        const active = res.data.policies.filter(p => p.status === 'Active');
        setPolicies(active);

        const preselectedId = location.state?.policyId || (active.length > 0 ? active[0].id : '');
        setFormData(prev => ({ ...prev, policy_id: preselectedId }));
      }
    } catch (err) {
      console.error('Error fetching policies for claim:', err);
    }
  };

  const selectedPolicy = policies.find(p => p.id == formData.policy_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.policy_id) {
      setError('Please select an active policy.');
      return;
    }

    if (Number(formData.claim_amount) <= 0) {
      setError('Claim amount must be greater than zero.');
      return;
    }

    if (selectedPolicy && Number(formData.claim_amount) > Number(selectedPolicy.sum_insured)) {
      setError(`Claim amount cannot exceed policy sum insured (₹${Number(selectedPolicy.sum_insured).toLocaleString()}).`);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/claims/file', formData);
      if (res.data.success) {
        setSuccess(`Claim submitted successfully! Tracking Number: ${res.data.claimNumber}`);
        setTimeout(() => {
          navigate('/client/claims');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="File an Insurance Claim" />

        <div className="page-container">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Submit Reimbursement or Cashless Claim</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Fill out incident information and upload hospital or repair documentation.
                  </p>
                </div>
              </div>

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

              {policies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px' }}>
                  <ShieldAlert size={36} color="var(--warning)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    You currently have no <strong>Active</strong> policies to file a claim against.
                  </p>
                  <button onClick={() => navigate('/client/browse')} className="btn btn-primary">
                    Browse & Apply for Policy
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Select Covered Policy *</label>
                    <select
                      className="form-control"
                      value={formData.policy_id}
                      onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
                      required
                    >
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.policy_name} ({p.policy_number}) - Max Cover: ₹{Number(p.sum_insured).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-group">
                      <label className="form-label">Claim Type / Nature of Loss *</label>
                      <select
                        className="form-control"
                        value={formData.claim_type}
                        onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })}
                      >
                        <option value="Medical Hospitalization">Medical Hospitalization</option>
                        <option value="Critical Illness">Critical Illness</option>
                        <option value="Vehicle Accidental Damage">Vehicle Accidental Damage</option>
                        <option value="Property Water/Fire Damage">Property Water/Fire Damage</option>
                        <option value="Theft or Burglary">Theft or Burglary</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date of Incident / Occurrence *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.incident_date}
                        onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Claim Amount Claimed (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 45000"
                      value={formData.claim_amount}
                      onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
                      required
                    />
                    {selectedPolicy && (
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Maximum Policy Insured Sum: ₹{Number(selectedPolicy.sum_insured).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Incident Description & Medical/Repair Details *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Describe what occurred, hospital or workshop name, treating physician, diagnosis or accident location..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supporting Document Attachment</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. hospital_bills_report.pdf"
                        value={formData.document_name}
                        onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      In academic demonstration, enter document file name or discharge summary report.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                    disabled={loading}
                  >
                    <FilePlus2 size={16} />
                    <span>{loading ? 'Submitting Claim...' : 'Submit Claim Application'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

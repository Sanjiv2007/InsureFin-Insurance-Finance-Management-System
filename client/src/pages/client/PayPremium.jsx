/**
 * Premium Payment Simulation View (Client)
 * Real-time digital payment simulation (UPI, Card, Net Banking),
 * records payment in database, and generates downloadable/printable receipt.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, ShieldCheck, Printer, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function PayPremium() {
  const location = useLocation();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [netBank, setNetBank] = useState('HDFC Bank');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies/my-policies');
      if (res.data.success) {
        setPolicies(res.data.policies);
        // If passed via route state
        if (location.state?.policy?.id) {
          setSelectedPolicyId(location.state.policy.id);
        } else if (res.data.policies.length > 0) {
          setSelectedPolicyId(res.data.policies[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching policies for payment:', err);
    }
  };

  const selectedPolicy = policies.find(p => p.id == selectedPolicyId);
  const payableAmount = selectedPolicy ? selectedPolicy.premium_amount : 0;

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedPolicyId || !payableAmount) {
      setError('Please select a valid policy to pay premium.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/payments/pay', {
        policy_id: selectedPolicyId,
        amount: payableAmount,
        payment_method: paymentMethod
      });

      if (res.data.success) {
        setReceipt(res.data.receipt);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Pay Insurance Premium" />

        <div className="page-container">
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Digital Premium Payment Portal</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Simulated academic payment gateway with instant transaction receipt generation.
                  </p>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePay}>
                {/* Select Policy */}
                <div className="form-group">
                  <label className="form-label">Select Policy Plan *</label>
                  <select
                    className="form-control"
                    value={selectedPolicyId}
                    onChange={(e) => setSelectedPolicyId(e.target.value)}
                    required
                  >
                    {policies.length === 0 ? (
                      <option value="">No policies available</option>
                    ) : (
                      policies.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.policy_name} ({p.policy_number}) - ₹{Number(p.premium_amount).toLocaleString()}/yr [{p.status}]
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Amount Summary Card */}
                <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payable Premium Amount</span>
                      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                        ₹{Number(payableAmount).toLocaleString()}
                      </h2>
                    </div>
                    <span className="badge badge-active">Annual Billing</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="form-group">
                  <label className="form-label">Select Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {['UPI', 'Debit Card', 'Net Banking'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        className={`btn ${paymentMethod === m ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setPaymentMethod(m)}
                        style={{ padding: '10px' }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Method Details */}
                {paymentMethod === 'UPI' && (
                  <div className="form-group">
                    <label className="form-label">UPI ID / VPA</label>
                    <input
                      type="text"
                      className="form-control"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      required
                    />
                  </div>
                )}

                {paymentMethod === 'Debit Card' && (
                  <div>
                    <div className="form-group">
                      <label className="form-label">Card Number (Simulated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">Expiry MM/YY</label>
                        <input type="text" className="form-control" defaultValue="12/28" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV</label>
                        <input type="password" className="form-control" defaultValue="123" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div className="form-group">
                    <label className="form-label">Select Bank</label>
                    <select
                      className="form-control"
                      value={netBank}
                      onChange={(e) => setNetBank(e.target.value)}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '15px' }}
                  disabled={loading || policies.length === 0}
                >
                  <CreditCard size={18} />
                  <span>{loading ? 'Processing Transaction...' : `Pay ₹${Number(payableAmount).toLocaleString()} Now`}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Official Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => { setReceiptModalOpen(false); navigate('/client/policies'); }}
        title="Insurance Premium Receipt"
        maxWidth="500px"
      >
        {receipt && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed var(--border-color)', marginBottom: '16px' }}>
              <CheckCircle2 size={42} color="var(--success)" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>Payment Successful</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>InsureFin - Insurance & Finance Management System</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
                <code>{receipt.transactionId}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policy Number:</span>
                <strong>{receipt.policyNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policy Plan:</span>
                <span>{receipt.policyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
                <span>{receipt.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date & Time:</span>
                <span>{new Date(receipt.paymentDate).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '16px' }}>
                <strong>Total Amount Paid:</strong>
                <strong style={{ color: 'var(--success)' }}>₹{Number(receipt.amount).toLocaleString()}</strong>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '20px 0 0', marginTop: '20px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary">
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => { setReceiptModalOpen(false); navigate('/client/policies'); }}
                className="btn btn-primary"
              >
                Go to My Policies
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

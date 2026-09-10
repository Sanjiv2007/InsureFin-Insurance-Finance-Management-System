/**
 * Payment & Premium Management View (Admin / Staff)
 * Shows all recorded policy premium payments and transaction receipts
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, Download, Printer } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = '/payments?';
      if (methodFilter) url += `payment_method=${methodFilter}&`;
      const res = await api.get(url);
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = (pm) => {
    setSelectedPayment(pm);
    setReceiptModalOpen(true);
  };

  const filteredPayments = payments.filter(p =>
    p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.policy_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Premium Payments & Receipts" />

        <div className="page-container">
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by transaction ID, policy, or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '180px' }}
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                >
                  <option value="">All Payment Modes</option>
                  <option value="UPI">UPI</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Client Name</th>
                    <th>Policy Subscribed</th>
                    <th>Amount Paid</th>
                    <th>Method</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading payment records...' : 'No payments found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pm) => (
                      <tr key={pm.id}>
                        <td><code>{pm.transaction_id}</code></td>
                        <td>
                          <strong>{pm.client_name || 'Client'}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pm.client_phone}</div>
                        </td>
                        <td>
                          <div><strong>{pm.policy_name}</strong></div>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{pm.policy_number}</span>
                        </td>
                        <td><strong>₹{Number(pm.amount).toLocaleString()}</strong></td>
                        <td>
                          <span className="badge badge-submitted">{pm.payment_method}</span>
                        </td>
                        <td>{new Date(pm.payment_date || Date.now()).toLocaleDateString()}</td>
                        <td><span className="badge badge-paid">{pm.status}</span></td>
                        <td>
                          <button
                            onClick={() => handleOpenReceipt(pm)}
                            className="btn btn-secondary btn-sm"
                            title="View Receipt"
                          >
                            Receipt
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

      {/* Payment Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Insurance Premium Receipt"
        maxWidth="500px"
      >
        {selectedPayment && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px dashed var(--border-color)', marginBottom: '16px' }}>
              <CheckCircle2 size={38} color="var(--success)" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Payment Received</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>InsureFin - Insurance & Finance Management System</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction Ref:</span>
                <code>{selectedPayment.transaction_id}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policyholder:</span>
                <strong>{selectedPayment.client_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policy Plan:</span>
                <span>{selectedPayment.policy_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Policy Number:</span>
                <span>{selectedPayment.policy_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span>{selectedPayment.payment_method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Date:</span>
                <span>{new Date(selectedPayment.payment_date || Date.now()).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '16px' }}>
                <strong>Amount Paid:</strong>
                <strong style={{ color: 'var(--success)' }}>₹{Number(selectedPayment.amount).toLocaleString()}</strong>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '20px 0 0', marginTop: '20px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary">
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button onClick={() => setReceiptModalOpen(false)} className="btn btn-primary">Done</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

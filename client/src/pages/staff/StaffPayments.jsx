/**
 * Staff Premium Payment Ledger View
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Printer, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';

export default function StaffPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
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
        <Navbar title="Premium Payment Transactions" />

        <div className="page-container">
          <div className="card">
            <div className="card-header">
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: '360px' }}
                placeholder="Search transaction ID, client, or policy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Customer Name</th>
                    <th>Policy Plan</th>
                    <th>Amount Paid</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loading ? 'Loading payments...' : 'No payments found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pm) => (
                      <tr key={pm.id}>
                        <td><code>{pm.transaction_id}</code></td>
                        <td>{pm.client_name || 'Client'}</td>
                        <td>{pm.policy_name}</td>
                        <td><strong>₹{Number(pm.amount).toLocaleString()}</strong></td>
                        <td><span className="badge badge-submitted">{pm.payment_method}</span></td>
                        <td>{new Date(pm.payment_date || Date.now()).toLocaleDateString()}</td>
                        <td><span className="badge badge-paid">{pm.status}</span></td>
                        <td>
                          <button
                            onClick={() => { setSelectedPayment(pm); setReceiptModalOpen(true); }}
                            className="btn btn-secondary btn-sm"
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

      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Payment Confirmation Receipt"
        maxWidth="480px"
      >
        {selectedPayment && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 8px' }} />
              <h3>₹{Number(selectedPayment.amount).toLocaleString()}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Transaction Reference: {selectedPayment.transaction_id}</p>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Client:</strong> {selectedPayment.client_name}</div>
              <div><strong>Policy:</strong> {selectedPayment.policy_name} ({selectedPayment.policy_number})</div>
              <div><strong>Method:</strong> {selectedPayment.payment_method}</div>
              <div><strong>Date:</strong> {new Date(selectedPayment.payment_date || Date.now()).toLocaleString()}</div>
            </div>
            <div className="modal-footer" style={{ marginTop: '20px' }}>
              <button onClick={() => window.print()} className="btn btn-secondary"><Printer size={16} /> Print</button>
              <button onClick={() => setReceiptModalOpen(false)} className="btn btn-primary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

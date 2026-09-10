/**
 * My Transactions View (Client)
 * Personal statement of premium contributions and claim payouts
 */

import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMyTransactions();
  }, []);

  const fetchMyTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTx = transactions.filter(t =>
    t.reference_id?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Personal Transactions & Receipts" />

        <div className="page-container">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Personal Financial Statement</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Complete ledger of your premium transactions and claim settlements.
                </p>
              </div>
              <input
                type="text"
                className="form-control"
                style={{ maxWidth: '300px' }}
                placeholder="Search reference or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Reference ID</th>
                    <th>Type</th>
                    <th>Transaction Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                        {loading ? 'Loading transactions...' : 'No transaction records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((t) => (
                      <tr key={t.id}>
                        <td><code>{t.reference_id}</code></td>
                        <td>
                          <span className={`badge ${t.transaction_type === 'Premium' ? 'badge-paid' : 'badge-rejected'}`}>
                            {t.transaction_type}
                          </span>
                        </td>
                        <td style={{ maxWidth: '350px' }}>{t.description}</td>
                        <td>
                          <strong style={{ color: t.transaction_type === 'Premium' ? 'var(--success)' : 'var(--danger)' }}>
                            {t.transaction_type === 'Premium' ? '-' : '+'}₹{Number(t.amount).toLocaleString()}
                          </strong>
                        </td>
                        <td>{new Date(t.transaction_date || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reports & System Auditing View (Admin)
 * Generate and export policy, premium, claims, and client analytics reports
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, Printer, Download, Filter, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function Reports() {
  const [reportType, setReportType] = useState('policies');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let res;
      if (reportType === 'policies') res = await api.get('/policies');
      else if (reportType === 'premiums') res = await api.get('/payments');
      else if (reportType === 'claims') res = await api.get('/claims');
      else if (reportType === 'clients') res = await api.get('/clients');

      if (res?.data?.success) {
        setReportData(res.data[reportType] || res.data.policies || res.data.payments || res.data.claims || res.data.clients || []);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Management Reports & Audits" />

        <div className="page-container">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Select Report Module:</span>
                <select
                  className="form-control"
                  style={{ width: '220px' }}
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="policies">Policy Underwriting Report</option>
                  <option value="premiums">Premium Collection Report</option>
                  <option value="claims">Insurance Claims & Settlements</option>
                  <option value="clients">Client KYC & Demographics</option>
                </select>
              </div>

              <button onClick={() => window.print()} className="btn btn-secondary">
                <Printer size={16} />
                <span>Print / Save as PDF</span>
              </button>
            </div>

            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700' }}>
                  {reportType === 'policies' && 'Insurance Policies Statement'}
                  {reportType === 'premiums' && 'Premium Collections Ledger'}
                  {reportType === 'claims' && 'Insurance Claims Settlement Summary'}
                  {reportType === 'clients' && 'Client Register & KYC Verification'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Generated on {new Date().toLocaleDateString()} | Total Records: {reportData.length}
                </span>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                {reportType === 'policies' && (
                  <>
                    <thead>
                      <tr>
                        <th>Policy #</th>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Plan Name</th>
                        <th>Sum Insured</th>
                        <th>Premium</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(p => (
                        <tr key={p.id}>
                          <td><code>{p.policy_number}</code></td>
                          <td>{p.client_name || 'Client'}</td>
                          <td>{p.policy_type}</td>
                          <td>{p.policy_name}</td>
                          <td>₹{Number(p.sum_insured).toLocaleString()}</td>
                          <td>₹{Number(p.premium_amount).toLocaleString()}</td>
                          <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {reportType === 'premiums' && (
                  <>
                    <thead>
                      <tr>
                        <th>Txn Ref</th>
                        <th>Client</th>
                        <th>Policy Plan</th>
                        <th>Payment Mode</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(pm => (
                        <tr key={pm.id}>
                          <td><code>{pm.transaction_id}</code></td>
                          <td>{pm.client_name || 'Client'}</td>
                          <td>{pm.policy_name}</td>
                          <td>{pm.payment_method}</td>
                          <td><strong>₹{Number(pm.amount).toLocaleString()}</strong></td>
                          <td>{new Date(pm.payment_date || Date.now()).toLocaleDateString()}</td>
                          <td><span className="badge badge-paid">{pm.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {reportType === 'claims' && (
                  <>
                    <thead>
                      <tr>
                        <th>Claim #</th>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Claimed Amount</th>
                        <th>Settled Amount</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(c => (
                        <tr key={c.id}>
                          <td><code>{c.claim_number}</code></td>
                          <td>{c.client_name || 'Client'}</td>
                          <td>{c.claim_type}</td>
                          <td>₹{Number(c.claim_amount).toLocaleString()}</td>
                          <td>₹{Number(c.approved_amount || 0).toLocaleString()}</td>
                          <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                          <td>{c.staff_remark || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}

                {reportType === 'clients' && (
                  <>
                    <thead>
                      <tr>
                        <th>Client ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>KYC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map(cl => (
                        <tr key={cl.id}>
                          <td>#CL-{cl.id}</td>
                          <td>{cl.name}</td>
                          <td>{cl.email}</td>
                          <td>{cl.phone}</td>
                          <td>{cl.address || 'N/A'}</td>
                          <td><span className={`badge badge-${cl.kyc_status.toLowerCase()}`}>{cl.kyc_status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

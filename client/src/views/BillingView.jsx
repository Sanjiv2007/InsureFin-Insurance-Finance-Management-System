import React, { useState } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Receipt,
  Download,
  Plus
} from "lucide-react";
import { formatINR } from "../utils/currency";

export default function BillingView({ 
  payments, 
  ledger, 
  onPayInvoice, 
  onOpenReceipt, 
  onCreateInvoice, 
  role 
}) {
  const [activeSubTab, setActiveSubTab] = useState("invoices"); // 'invoices' | 'ledger'
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayments = payments.filter((p) => {
    if (statusFilter === "All") return true;
    return p.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const totalCollected = payments
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Premium Billing & Capital Ledger (₹ INR)</h1>
          <p className="page-subtitle">
            Track premium collections, UPI/RuPay payment gateways, invoices, and double-entry underwriting balances.
          </p>
        </div>

        {(role === "admin" || role === "staff") && (
          <button className="btn btn-primary" onClick={onCreateInvoice}>
            <Plus size={16} />
            <span>Issue Premium Invoice (₹)</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: "24px" }}>
        <div className="card kpi-card" style={{ "--card-accent": "var(--success)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Total Collected</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(16, 185, 129, 0.15)", "--icon-color": "var(--success)" }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{formatINR(totalCollected)}</div>
          <div className="kpi-subtext">Settled premium inflows</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--warning)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Outstanding Receivables</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(245, 158, 11, 0.15)", "--icon-color": "var(--warning)" }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--warning)" }}>{formatINR(totalPending)}</div>
          <div className="kpi-subtext">Scheduled upcoming dues</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--primary)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Invoices Processed</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(79, 70, 229, 0.15)", "--icon-color": "var(--primary-light)" }}>
              <Receipt size={18} />
            </div>
          </div>
          <div className="kpi-value">{payments.length}</div>
          <div className="kpi-subtext">Billing transactions</div>
        </div>
      </div>

      {/* View Switcher: Invoices vs Ledger */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
        <button
          className={`pill-btn ${activeSubTab === "invoices" ? "active" : ""}`}
          onClick={() => setActiveSubTab("invoices")}
        >
          Premium Invoices & Billing ({payments.length})
        </button>
        {role !== "client" && (
          <button
            className={`pill-btn ${activeSubTab === "ledger" ? "active" : ""}`}
            onClick={() => setActiveSubTab("ledger")}
          >
            Double-Entry Cash Ledger ({ledger.length})
          </button>
        )}
      </div>

      {activeSubTab === "invoices" && (
        <div>
          {/* Status Filter */}
          <div className="filter-toolbar">
            <div className="filter-pills">
              {["All", "Paid", "Pending", "Overdue"].map((st) => (
                <button
                  key={st}
                  className={`pill-btn ${statusFilter === st ? "active" : ""}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice & Policy</th>
                  <th>Client</th>
                  <th>Due Date</th>
                  <th>Amount (₹)</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pmt) => {
                  return (
                    <tr key={pmt.id}>
                      <td>
                        <div style={{ fontWeight: "700" }}>{pmt.invoiceNumber}</div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                          {pmt.policyNumber}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: "600" }}>{pmt.customerName}</div>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.85rem" }}>{pmt.dueDate}</div>
                        {pmt.paidDate && (
                          <div style={{ fontSize: "0.72rem", color: "var(--success)" }}>
                            Paid on: {pmt.paidDate}
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: "800", color: pmt.status === "Paid" ? "var(--success)" : "var(--text-primary)" }}>
                          {formatINR(pmt.amount)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          {pmt.paymentMethod || "Pending"}
                        </div>
                        {pmt.transactionRef && (
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {pmt.transactionRef}
                          </div>
                        )}
                      </td>

                      <td>
                        {pmt.status === "Paid" ? (
                          <span className="badge badge-paid">Paid</span>
                        ) : pmt.status === "Pending" ? (
                          <span className="badge badge-pending">Pending</span>
                        ) : (
                          <span className="badge badge-overdue">Overdue</span>
                        )}
                      </td>

                      <td>
                        {pmt.status === "Paid" ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenReceipt(pmt)}
                            title="View Official Payment Receipt"
                          >
                            <Receipt size={13} />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => onPayInvoice(pmt)}
                            title="Process Premium Payment"
                          >
                            <CreditCard size={13} />
                            <span>Pay Now (UPI/Card)</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "ledger" && role !== "client" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem" }}>Underwriting Capital Ledger (₹)</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Cryptographic immutable audit log of inflows (premiums) and outflows (claims settlements) in Indian Rupees.
              </p>
            </div>
            <span className="badge badge-active">Double-Entry Balanced</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Transaction Description</th>
                  <th>Reference</th>
                  <th>Amount (₹)</th>
                  <th>Balance After (₹)</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((item) => {
                  const isInflow = item.type === "INFLOW";
                  return (
                    <tr key={item.id}>
                      <td style={{ fontSize: "0.82rem" }}>{item.date}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: isInflow ? "var(--success-surface)" : "var(--danger-surface)",
                            color: isInflow ? "var(--success)" : "var(--danger)"
                          }}
                        >
                          {isInflow ? "Credit (Inflow)" : "Debit (Outflow)"}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", fontSize: "0.85rem" }}>{item.category}</td>
                      <td style={{ fontSize: "0.85rem" }}>{item.description}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {item.referenceId}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: "800",
                            color: isInflow ? "var(--success)" : "var(--danger)"
                          }}
                        >
                          {isInflow ? "+" : "-"}{formatINR(item.amount)}
                        </span>
                      </td>
                      <td style={{ fontWeight: "700", color: "var(--accent-cyan)" }}>
                        {formatINR(item.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { X, Receipt } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function CreateInvoiceModal({ isOpen, onClose, policies, onInvoiceCreated }) {
  if (!isOpen) return null;

  const [policyId, setPolicyId] = useState(policies[0]?.id || "");
  const [amount, setAmount] = useState(policies[0]?.premiumAmount || 3500);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  const selectedPolicy = policies.find(p => p.id === policyId) || policies[0];

  const handlePolicyChange = (id) => {
    setPolicyId(id);
    const p = policies.find(item => item.id === id);
    if (p) setAmount(p.premiumAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId,
          amount: Number(amount),
          dueDate
        })
      });

      if (res.ok) {
        const created = await res.json();
        onInvoiceCreated(created);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to generate invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting billing server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-icon" style={{ width: "34px", height: "34px" }}>
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="modal-title">Generate Premium Invoice (₹)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Issue receivable bill against Indian policy schedule
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Target Policy</label>
              <select
                className="form-control"
                value={policyId}
                onChange={(e) => handlePolicyChange(e.target.value)}
                required
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policyNumber} — {p.customerName} ({p.planName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Invoice Premium Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  step={500}
                  min={100}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
                  {formatINR(amount)}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Generating..." : "Issue & Post Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

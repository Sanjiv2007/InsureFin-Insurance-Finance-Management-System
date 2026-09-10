import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function AddCustomerModal({ isOpen, onClose, onCustomerCreated }) {
  if (!isOpen) return null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 9");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("Software Architect");
  const [annualIncome, setAnnualIncome] = useState(2400000); // ₹24 Lakhs
  const [creditScore, setCreditScore] = useState(760);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          occupation,
          annualIncome: Number(annualIncome),
          creditScore: Number(creditScore)
        })
      });

      if (res.ok) {
        const created = await res.json();
        onCustomerCreated(created);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create customer record");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-icon" style={{ width: "34px", height: "34px" }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="modal-title">Register Policyholder Client (India)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Create customer CRM record & initialize PAN / KYC verification
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
              <label className="form-label">Full Legal Name (as on PAN/Aadhaar)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="rahul.sharma@domain.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Mobile Number (+91)</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="Flat / House No, Society, City, State, PIN"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Profession / Industry</label>
                <input
                  type="text"
                  className="form-control"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Income (₹ INR)</label>
                <input
                  type="number"
                  className="form-control"
                  step={100000}
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
                  {formatINR(annualIncome)} / yr
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">CIBIL / Credit Score (300 - 900)</label>
              <input
                type="number"
                className="form-control"
                min={300}
                max={900}
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {creditScore >= 750 ? "Tier-1 Preferred Underwriting Premium Discount" : "Standard Actuarial Pool"}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Create Client Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { X, ShieldPlus, Calculator } from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR } from "../../utils/currency";

export default function IssuePolicyModal({ isOpen, onClose, customers, onPolicyCreated, preselectedCustomerId }) {
  if (!isOpen) return null;

  const [customerId, setCustomerId] = useState(preselectedCustomerId || (customers[0]?.id || ""));
  const [category, setCategory] = useState("Health");
  const [planName, setPlanName] = useState("Aegis Diamond Health Shield (Cashless)");
  const [coverageAmount, setCoverageAmount] = useState(2500000); // ₹25 Lakhs
  const [deductible, setDeductible] = useState(15000);          // ₹15,000
  const [paymentFrequency, setPaymentFrequency] = useState("Monthly");
  const [nominee, setNominee] = useState("Immediate Family / Spouse");
  const [terms, setTerms] = useState("Cashless across 12,000+ pan-India network hospitals. Zero co-pay, organ donor cover, and global OPD rider.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    switch (category) {
      case "Health":
        setPlanName("Aegis Diamond Health Shield (Cashless)");
        setCoverageAmount(2500000);
        setDeductible(15000);
        setTerms("Cashless across 12,000+ network hospitals. Zero co-pay, AYUSH inpatient cover, and restore benefit.");
        break;
      case "Auto":
        setPlanName("Prestige Motor Bumper-to-Bumper Shield");
        setCoverageAmount(3500000);
        setDeductible(10000);
        setTerms("Zero depreciation, engine & battery protection, 24x7 roadside assistance pan-India.");
        break;
      case "Life":
        setPlanName("Aegis Sovereign Level Term Life 30-Year");
        setCoverageAmount(10000000); // ₹1 Crore
        setDeductible(0);
        setTerms("Guaranteed level sum assured, critical illness rider, 100% tax exemption u/s 80C & 10(10D).");
        break;
      case "Property":
        setPlanName("Apex Griha Raksha Villa & Home Policy");
        setCoverageAmount(8000000); // ₹80 Lakhs
        setDeductible(25000);
        setTerms("Dwelling replacement cost, personal property, seismic, flood & cyclone coverage rider.");
        break;
      case "Commercial":
        setPlanName("Bharat Udyog Commercial Liability & Fire");
        setCoverageAmount(5000000); // ₹50 Lakhs
        setDeductible(50000);
        setTerms("Commercial warehouse fire, in-transit cargo, public liability & machinery breakdown.");
        break;
      default:
        break;
    }
  }, [category]);

  const calculatePremium = () => {
    let rate = 0.003;
    if (category === "Health") rate = 0.0055;
    if (category === "Auto") rate = 0.018;
    if (category === "Life") rate = 0.0018;
    if (category === "Property") rate = 0.0022;
    if (category === "Commercial") rate = 0.006;

    const annualGross = (coverageAmount * rate) * (1 - (deductible / coverageAmount) * 2);
    if (paymentFrequency === "Monthly") {
      return Math.max(1200, Math.round(annualGross / 12));
    }
    if (paymentFrequency === "Quarterly") {
      return Math.max(3500, Math.round(annualGross / 4));
    }
    return Math.max(12000, Math.round(annualGross));
  };

  const premiumAmount = calculatePremium();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          category,
          planName,
          coverageAmount: Number(coverageAmount),
          deductible: Number(deductible),
          premiumAmount,
          paymentFrequency,
          nominee,
          terms
        })
      });

      if (res.ok) {
        const created = await res.json();
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (err) {}
        onPolicyCreated(created);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to issue policy");
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
            <div className="brand-icon" style={{ width: "32px", height: "32px" }}>
              <ShieldPlus size={18} />
            </div>
            <div>
              <h2 className="modal-title">Underwrite & Issue Policy (₹ INR)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Aegis Actuarial Underwriting Desk • India
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Selector */}
            <div className="form-group">
              <label className="form-label">Insured Policyholder / Client</label>
              <select
                className="form-control"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.occupation} ({c.riskRating} Risk, FICO {c.creditScore})
                  </option>
                ))}
              </select>
            </div>

            {/* Category & Plan */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Insurance Line</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Health">Health Insurance (Cashless)</option>
                  <option value="Auto">Auto / Motor Insurance</option>
                  <option value="Life">Life & Term Insurance</option>
                  <option value="Property">Property & Homeowner</option>
                  <option value="Commercial">Commercial & Liability</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Plan Tier Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Sum Insured & Deductible */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sum Insured Limit (₹ INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={coverageAmount}
                  step={100000}
                  min={100000}
                  onChange={(e) => setCoverageAmount(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", fontWeight: "600" }}>
                  Selected: {formatINR(coverageAmount)}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Deductible (₹ INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={deductible}
                  step={2500}
                  min={0}
                  onChange={(e) => setDeductible(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  Selected: {formatINR(deductible)}
                </span>
              </div>
            </div>

            {/* Billing Cadence & Nominee */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Premium Payment Frequency</label>
                <select
                  className="form-control"
                  value={paymentFrequency}
                  onChange={(e) => setPaymentFrequency(e.target.value)}
                >
                  <option value="Monthly">Monthly Recurring</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual Lump Sum</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nominee / Beneficiary</label>
                <input
                  type="text"
                  className="form-control"
                  value={nominee}
                  onChange={(e) => setNominee(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Underwriting Terms */}
            <div className="form-group">
              <label className="form-label">Coverage Terms & Special Riders</label>
              <textarea
                className="form-control"
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>

            {/* Actuarial Live Quote Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)",
                border: "1px solid var(--border-focus)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Calculator size={22} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Calculated Premium Rate
                  </div>
                  <div style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {formatINR(premiumAmount)} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ {paymentFrequency}</span>
                  </div>
                </div>
              </div>
              <span className="badge badge-active" style={{ fontSize: "0.72rem" }}>
                IRDAI Actuarial Approved
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Underwriting..." : "Issue Policy & Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

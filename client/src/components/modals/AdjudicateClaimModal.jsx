import React, { useState } from "react";
import { X, FileCheck2, CheckCircle, XCircle, Camera, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR } from "../../utils/currency";

export default function AdjudicateClaimModal({ isOpen, onClose, claim, onAdjudicateComplete }) {
  if (!isOpen || !claim) return null;

  const [decision, setDecision] = useState("Approve");
  const [approvedAmount, setApprovedAmount] = useState(claim.claimAmount || 50000);
  const [notes, setNotes] = useState(
    "Inspected supporting photographic evidence and authorized workshop invoice. Deductible calculated and approved for direct NEFT disbursement."
  );
  const [adjusterName, setAdjusterName] = useState("Ananya Deshmukh, Senior Claims Officer");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/claims/${claim.id}/adjudicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          approvedAmount: decision === "Approve" ? Number(approvedAmount) : 0,
          notes,
          adjusterName
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (decision === "Approve") {
          try {
            confetti({
              particleCount: 75,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (err) {}
        }
        onAdjudicateComplete(data.claim, data.payoutReceipt);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Adjudication failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error reaching adjudication server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-icon" style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}>
              <FileCheck2 size={18} />
            </div>
            <div>
              <h2 className="modal-title">Adjudicate Claim (₹ INR)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {claim.claimNumber} • {claim.policyNumber}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Incident Summary Card */}
            <div
              style={{
                background: "rgba(0,0,0,0.25)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)" }}>
                    {claim.customerName} ({claim.category} Insurance)
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Incident Date: {claim.incidentDate} • Location: {claim.incidentLocation}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Claimed Loss</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {formatINR(claim.claimAmount)}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                "{claim.description}"
              </div>

              {claim.evidencePhotos && claim.evidencePhotos.length > 0 && (
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  {claim.evidencePhotos.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt="Incident proof"
                      style={{ width: "90px", height: "60px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Decision Toggle */}
            <div className="form-group">
              <label className="form-label">Adjudication Verdict</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button
                  type="button"
                  className="card"
                  style={{
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    borderColor: decision === "Approve" ? "var(--success)" : "var(--border-subtle)",
                    background: decision === "Approve" ? "var(--success-surface)" : "var(--bg-input)"
                  }}
                  onClick={() => {
                    setDecision("Approve");
                    setNotes("Loss verified against policy schedule. Full settlement payout authorized via direct bank transfer.");
                  }}
                >
                  <CheckCircle size={20} color="var(--success)" />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "700", fontSize: "0.88rem", color: decision === "Approve" ? "var(--success)" : "var(--text-primary)" }}>
                      Approve & Settle Payout
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Disburse ₹ funds to bank account
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className="card"
                  style={{
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    borderColor: decision === "Reject" ? "var(--danger)" : "var(--border-subtle)",
                    background: decision === "Reject" ? "var(--danger-surface)" : "var(--bg-input)"
                  }}
                  onClick={() => {
                    setDecision("Reject");
                    setNotes("Claim formally declined. Circumstances fall under explicit policy exclusion clause.");
                  }}
                >
                  <XCircle size={20} color="var(--danger)" />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "700", fontSize: "0.88rem", color: decision === "Reject" ? "var(--danger)" : "var(--text-primary)" }}>
                      Decline / Reject Claim
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Issue formal declination notice
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Approved Payout Field */}
            {decision === "Approve" && (
              <div className="form-group">
                <label className="form-label">Authorized Settlement Payout (₹ INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={approvedAmount}
                  max={claim.claimAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: "0.74rem", color: "var(--accent-cyan)" }}>
                  Maximum limit of this claim: {formatINR(claim.claimAmount)}
                </span>
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Official Adjuster Inspection & Audit Findings</label>
              <textarea
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Certifying Claims Adjuster</label>
              <input
                type="text"
                className="form-control"
                value={adjusterName}
                onChange={(e) => setAdjusterName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${decision === "Approve" ? "btn-success" : "btn-outline-danger"}`}
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : decision === "Approve"
                ? `Authorize & Settle ${formatINR(approvedAmount)}`
                : "Confirm Formal Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { X, AlertTriangle, Upload, FileCheck, Camera } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function FileClaimModal({ isOpen, onClose, policies, onClaimFiled }) {
  if (!isOpen) return null;

  const activePolicies = policies.filter(p => p.status === "Active" || p.status === "Grace Period");
  const [policyId, setPolicyId] = useState(activePolicies[0]?.id || "");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [incidentLocation, setIncidentLocation] = useState("Bandra West, Mumbai");
  const [claimAmount, setClaimAmount] = useState(45000); // ₹45,000
  const [description, setDescription] = useState(
    "Vehicle fender damage occurred in heavy monsoon rain traffic on Western Express Highway. Towed to authorized body workshop."
  );
  const [evidencePhoto, setEvidencePhoto] = useState(
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80"
  );
  const [submitting, setSubmitting] = useState(false);

  const selectedPolicy = policies.find(p => p.id === policyId) || activePolicies[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!policyId) {
      alert("Please select an active policy");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId,
          incidentDate,
          incidentLocation,
          claimAmount: Number(claimAmount),
          description,
          evidencePhotos: [evidencePhoto]
        })
      });

      if (res.ok) {
        const newClaim = await res.json();
        onClaimFiled(newClaim);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit claim");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-icon" style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)" }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="modal-title">File an Insurance Claim (₹)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Submit incident details and forensic proof for surveyor review
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Policy Selection */}
            <div className="form-group">
              <label className="form-label">Linked Active Policy</label>
              <select
                className="form-control"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                required
              >
                {activePolicies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policyNumber} — {p.planName} ({p.customerName})
                  </option>
                ))}
              </select>
            </div>

            {selectedPolicy && (
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "0.82rem", display: "flex", justifyContent: "space-between" }}>
                <span>Line: <strong>{selectedPolicy.category}</strong></span>
                <span>Max Sum Insured: <strong>{formatINR(selectedPolicy.coverageAmount)}</strong></span>
                <span>Deductible: <strong>{formatINR(selectedPolicy.deductible)}</strong></span>
              </div>
            )}

            {/* Date & Location */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Incident</label>
                <input
                  type="date"
                  className="form-control"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Loss Amount (₹ INR)</label>
                <input
                  type="number"
                  className="form-control"
                  value={claimAmount}
                  step={5000}
                  min={1000}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)" }}>
                  {formatINR(claimAmount)}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Incident Location (City / Street / Hospital)</label>
              <input
                type="text"
                className="form-control"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Loss Description & Circumstances</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Photo Evidence URL */}
            <div className="form-group">
              <label className="form-label">Supporting Evidence Photo / Surveyor Report URL</label>
              <input
                type="url"
                className="form-control"
                value={evidencePhoto}
                onChange={(e) => setEvidencePhoto(e.target.value)}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Presets:</span>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "var(--primary-light)", fontSize: "0.74rem", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => setEvidencePhoto("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80")}
                >
                  Vehicle Damage
                </button>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "var(--primary-light)", fontSize: "0.74rem", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => setEvidencePhoto("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80")}
                >
                  Property Damage
                </button>
                <button
                  type="button"
                  style={{ background: "transparent", border: "none", color: "var(--primary-light)", fontSize: "0.74rem", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => setEvidencePhoto("https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=80")}
                >
                  Hospital Discharge Summary
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting Claim..." : "Submit Claim for Triage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

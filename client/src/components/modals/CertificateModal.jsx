import React from "react";
import { X, ShieldCheck, Printer, Award } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function CertificateModal({ isOpen, onClose, policy }) {
  if (!isOpen || !policy) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Award size={20} color="var(--primary-light)" />
            <h2 className="modal-title">Certificate of Insurance (₹ INR)</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Printable Certificate Sheet */}
          <div
            style={{
              background: "#ffffff",
              color: "#0f172a",
              padding: "36px",
              borderRadius: "var(--radius-md)",
              border: "8px double #cbd5e1",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}
          >
            {/* Header / Watermark */}
            <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#4338ca", fontWeight: "900", fontSize: "1.3rem", letterSpacing: "0.08em" }}>
                <ShieldCheck size={26} />
                AEGIS INDIA GENERAL INSURANCE CO. LTD.
              </div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748b", marginTop: "4px" }}>
                IRDAI Registration No. 162 • IRDAI/NL-GEN/2024/09
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0f172a", marginTop: "4px" }}>
                Policy Certificate Ref: {policy.policyNumber}
              </div>
            </div>

            {/* Certificate Body */}
            <div style={{ fontSize: "0.88rem", lineHeight: "1.6", marginBottom: "24px" }}>
              <p>
                This certifies that the insurance contract identified below has been issued to the named insured in the Republic of India and is in full force and effect in accordance with certified IRDAI statutory covenants.
              </p>
            </div>

            {/* Table Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "#f8fafc", padding: "18px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Named Insured</div>
                <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a" }}>{policy.customerName}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Policy Plan & Tier</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>{policy.planName}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Insurance Classification</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#4338ca" }}>{policy.category} Comprehensive</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Nominated Beneficiary</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>{policy.nominee}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Total Sum Insured (₹)</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "#059669" }}>{formatINR(policy.coverageAmount)}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Applicable Deductible (₹)</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{formatINR(policy.deductible)}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Effective Term</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#0f172a" }}>{policy.startDate} to {policy.endDate}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>Underwriting Status</div>
                <div style={{ fontSize: "0.88rem", fontWeight: "800", color: policy.status === "Active" ? "#059669" : "#d97706" }}>
                  {policy.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Terms Rider */}
            <div style={{ fontSize: "0.78rem", color: "#475569", borderLeft: "3px solid #4338ca", paddingLeft: "12px", marginBottom: "24px" }}>
              <strong>Special Statutory Endorsement:</strong> {policy.terms}
            </div>

            {/* Signature & Seal Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
              <div>
                <div style={{ fontFamily: "cursive", fontSize: "1.25rem", color: "#1e1b4b", borderBottom: "1px solid #94a3b8", width: "170px", marginBottom: "4px" }}>
                  Ananya Deshmukh
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
                  Authorized Underwriting Officer • Aegis India
                </div>
              </div>

              {/* Gold Embossed Seal Representation */}
              <div
                style={{
                  width: "75px",
                  height: "75px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #fde047 0%, #ca8a04 100%)",
                  boxShadow: "0 2px 10px rgba(202, 138, 4, 0.4)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#713f12",
                  fontSize: "0.55rem",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  textAlign: "center",
                  border: "2px dashed #854d0e"
                }}
              >
                <span>AEGIS</span>
                <span>IRDAI</span>
                <span>VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

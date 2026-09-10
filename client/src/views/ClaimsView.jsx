import React, { useState } from "react";
import { 
  AlertTriangle, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Eye, 
  ShieldAlert,
  User,
  Camera
} from "lucide-react";
import { formatINR } from "../utils/currency";

export default function ClaimsView({ 
  claims, 
  policies, 
  onOpenFileClaim, 
  onAdjudicateClaim, 
  onOpenPayoutReceipt, 
  onAssignAdjuster,
  role 
}) {
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = claims.filter((c) => {
    if (statusFilter === "All") return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const submittedCount = claims.filter(c => c.status === "Submitted").length;
  const underReviewCount = claims.filter(c => c.status === "Under Review").length;
  const settledCount = claims.filter(c => c.status === "Settled").length;
  const rejectedCount = claims.filter(c => c.status === "Rejected").length;

  const totalSettledAmount = claims
    .filter(c => c.status === "Settled")
    .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return <span className="badge badge-submitted">Submitted</span>;
      case "Under Review":
        return <span className="badge badge-under-review">Under Review</span>;
      case "Settled":
        return <span className="badge badge-settled">Settled</span>;
      case "Rejected":
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Claims Adjudication & Payout Workbench (₹)</h1>
          <p className="page-subtitle">
            Incident evidence triage, forensic verification, approved settlement disbursement, and fraud prevention.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenFileClaim}>
          <Plus size={16} />
          <span>File Incident Claim</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "24px" }}>
        <div className="card kpi-card" style={{ "--card-accent": "var(--primary)" }}>
          <div className="kpi-header">
            <span className="kpi-title">New Inquiries</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(79, 70, 229, 0.15)", "--icon-color": "var(--primary-light)" }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{submittedCount}</div>
          <div className="kpi-subtext">Awaiting triage assignment</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--warning)" }}>
          <div className="kpi-header">
            <span className="kpi-title">In Adjudication</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(245, 158, 11, 0.15)", "--icon-color": "var(--warning)" }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--warning)" }}>{underReviewCount}</div>
          <div className="kpi-subtext">Active forensic surveys</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--success)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Settled Payouts</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(16, 185, 129, 0.15)", "--icon-color": "var(--success)" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{formatINR(totalSettledAmount)}</div>
          <div className="kpi-subtext">{settledCount} claims approved & paid</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--danger)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Declinations</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(239, 68, 68, 0.15)", "--icon-color": "var(--danger)" }}>
              <XCircle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{rejectedCount}</div>
          <div className="kpi-subtext">Exclusion / fraud denials</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-pills">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginRight: "4px" }}>
            Stage:
          </span>
          {["All", "Submitted", "Under Review", "Settled", "Rejected"].map((st) => (
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

      {/* Claims List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map((claim) => {
          return (
            <div key={claim.id} className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: "700", color: "var(--primary-light)", fontSize: "0.95rem" }}>
                      {claim.claimNumber}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>•</span>
                    <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{claim.category} Insurance Claim</span>
                    {getStatusBadge(claim.status)}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Policy: <strong style={{ color: "var(--text-secondary)" }}>{claim.policyNumber}</strong> | Policyholder: <strong style={{ color: "var(--text-secondary)" }}>{claim.customerName}</strong>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Claimed Amount</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                    {formatINR(claim.claimAmount)}
                  </div>
                  {claim.approvedAmount !== null && (
                    <div style={{ fontSize: "0.78rem", color: claim.approvedAmount > 0 ? "var(--success)" : "var(--danger)", fontWeight: "700" }}>
                      {claim.approvedAmount > 0 ? `Settled: ${formatINR(claim.approvedAmount)}` : "Declined (₹0)"}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Section: Incident Details & Evidence Preview */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px", background: "rgba(0, 0, 0, 0.2)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                    Incident Statement & Loss Description
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>
                    {claim.description}
                  </p>

                  <div style={{ display: "flex", gap: "20px", marginTop: "12px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    <span>Incident Date: <strong style={{ color: "var(--text-primary)" }}>{claim.incidentDate}</strong></span>
                    <span>Filed On: <strong style={{ color: "var(--text-primary)" }}>{claim.filedDate}</strong></span>
                    <span>Location: <strong style={{ color: "var(--text-primary)" }}>{claim.incidentLocation}</strong></span>
                  </div>
                </div>

                {/* Evidence Thumbnail */}
                {claim.evidencePhotos && claim.evidencePhotos.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Camera size={13} />
                      <span>Evidence ({claim.evidencePhotos.length})</span>
                    </div>
                    <img
                      src={claim.evidencePhotos[0]}
                      alt="Claim Incident Evidence"
                      style={{
                        width: "100%",
                        height: "80px",
                        borderRadius: "var(--radius-sm)",
                        objectFit: "cover",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer"
                      }}
                      onClick={() => window.open(claim.evidencePhotos[0], '_blank')}
                      title="Click to expand evidence photo"
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    No photos attached
                  </div>
                )}
              </div>

              {/* Adjuster Notes & Actions Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", paddingTop: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem" }}>
                  <User size={15} color="var(--primary-light)" />
                  <span style={{ color: "var(--text-muted)" }}>Adjuster:</span>
                  <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{claim.adjusterName}</span>
                  {claim.adjusterNotes && (
                    <span style={{ color: "var(--text-muted)", marginLeft: "10px", fontStyle: "italic" }}>
                      — "{claim.adjusterNotes.slice(0, 60)}..."
                    </span>
                  )}
                </div>

                {/* Role-Specific Actions */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {claim.status === "Submitted" && (role === "admin" || role === "staff") && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onAssignAdjuster(claim.id)}
                    >
                      <FileCheck2 size={14} />
                      <span>Accept Case & Investigate</span>
                    </button>
                  )}

                  {claim.status === "Under Review" && (role === "admin" || role === "staff") && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onAdjudicateClaim(claim)}
                    >
                      <span>Adjudicate & Disburse Payout (₹)</span>
                    </button>
                  )}

                  {claim.status === "Settled" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenPayoutReceipt(claim)}
                    >
                      <span>Settlement Voucher</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Search,
  Building,
  Mail,
  Phone
} from "lucide-react";
import { formatINR, formatINRCompact } from "../utils/currency";

export default function CustomersView({ 
  customers, 
  onAddCustomer, 
  onSelectCustomer, 
  onUpdateKyc, 
  role,
  onIssuePolicyForCustomer 
}) {
  const [kycFilter, setKycFilter] = useState("All");

  const filtered = customers.filter((c) => {
    if (kycFilter === "All") return true;
    return c.kycStatus.toLowerCase() === kycFilter.toLowerCase();
  });

  const verifiedCount = customers.filter(c => c.kycStatus === "Verified").length;
  const pendingCount = customers.filter(c => c.kycStatus === "Pending").length;
  const actionCount = customers.filter(c => c.kycStatus === "Action Required").length;

  const getKycBadge = (status) => {
    switch (status) {
      case "Verified":
        return <span className="badge badge-verified">Verified</span>;
      case "Pending":
        return <span className="badge badge-pending">Pending Review</span>;
      case "Action Required":
        return <span className="badge badge-action-required">Action Needed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Portfolio & KYC Directory (India)</h1>
          <p className="page-subtitle">
            Manage Indian policyholder identities, PAN/Aadhaar KYC profiles, credit ratings, and sum insured portfolios.
          </p>
        </div>

        {(role === "admin" || role === "staff") && (
          <button className="btn btn-primary" onClick={onAddCustomer}>
            <UserPlus size={16} />
            <span>Register New Client</span>
          </button>
        )}
      </div>

      {/* KPI Overview */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "24px" }}>
        <div className="card kpi-card" style={{ "--card-accent": "var(--primary)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Total Insured Clients</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(79, 70, 229, 0.15)", "--icon-color": "var(--primary-light)" }}>
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{customers.length}</div>
          <div className="kpi-subtext">Active policyholders</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--success)" }}>
          <div className="kpi-header">
            <span className="kpi-title">KYC Verified</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(16, 185, 129, 0.15)", "--icon-color": "var(--success)" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{verifiedCount}</div>
          <div className="kpi-subtext">Full AML/Aadhaar compliant</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--warning)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Pending KYC</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(245, 158, 11, 0.15)", "--icon-color": "var(--warning)" }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--warning)" }}>{pendingCount}</div>
          <div className="kpi-subtext">Documents in triage</div>
        </div>

        <div className="card kpi-card" style={{ "--card-accent": "var(--danger)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Action Required</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(239, 68, 68, 0.15)", "--icon-color": "var(--danger)" }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{actionCount}</div>
          <div className="kpi-subtext">High risk or missing PAN</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-pills">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginRight: "4px" }}>
            KYC Filter:
          </span>
          {["All", "Verified", "Pending", "Action Required"].map((st) => (
            <button
              key={st}
              className={`pill-btn ${kycFilter === st ? "active" : ""}`}
              onClick={() => setKycFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Client / Contact</th>
              <th>Profession & Annual Income</th>
              <th>Credit / Risk</th>
              <th>Inforce Portfolio (₹)</th>
              <th>KYC Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              return (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={c.avatar}
                        alt={c.name}
                        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-subtle)" }}
                      />
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{c.name}</div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{c.email}</span>
                          <span>•</span>
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: "600" }}>{c.occupation}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {formatINRCompact(c.annualIncome)} / yr
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: "700" }}>{c.creditScore}</span>
                      <span
                        className="badge"
                        style={{
                          fontSize: "0.68rem",
                          background: c.riskRating === "Low" ? "var(--success-surface)" : c.riskRating === "Medium" ? "var(--warning-surface)" : "var(--danger-surface)",
                          color: c.riskRating === "Low" ? "var(--success)" : c.riskRating === "Medium" ? "var(--warning)" : "var(--danger)"
                        }}
                      >
                        {c.riskRating} Risk
                      </span>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: "700", color: "var(--accent-cyan)" }}>
                      {formatINR(c.totalCoverage)}
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      {c.activePolicyCount} active ({c.policyCount} total)
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {getKycBadge(c.kycStatus)}
                      {role !== "client" && c.kycStatus !== "Verified" && (
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                          onClick={() => onUpdateKyc(c.id, "Verified")}
                          title="Instant KYC Approval"
                        >
                          Verify Now
                        </button>
                      )}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectCustomer(c.id)}
                        title="View Detailed Profile & Policy Vault"
                      >
                        Profile & Vault
                      </button>
                      {(role === "admin" || role === "staff") && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onIssuePolicyForCustomer(c.id)}
                          title="Assign new policy to this customer"
                        >
                          + Policy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

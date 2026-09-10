import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  ShieldCheck, 
  Heart, 
  Car, 
  Home, 
  Briefcase, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Download,
  CheckCircle2,
  Filter
} from "lucide-react";
import { formatINR } from "../utils/currency";

export default function PoliciesView({ 
  policies, 
  customers, 
  onIssuePolicy, 
  onOpenCertificate, 
  role,
  onViewCustomer 
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const categories = ["All", "Health", "Auto", "Life", "Property", "Commercial"];
  const statuses = ["All", "Active", "Grace Period", "Expiring Soon", "Under Review"];

  const filtered = policies.filter((p) => {
    const matchCat = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchStat = selectedStatus === "All" || p.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchCat && matchStat;
  });

  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case "health": return <Heart size={20} color="var(--accent-cyan)" />;
      case "auto": return <Car size={20} color="var(--primary-light)" />;
      case "life": return <ShieldCheck size={20} color="var(--purple)" />;
      case "property": return <Home size={20} color="var(--warning)" />;
      case "commercial": return <Briefcase size={20} color="var(--success)" />;
      default: return <FileText size={20} color="var(--primary-light)" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active": return <span className="badge badge-active">Active</span>;
      case "Grace Period": return <span className="badge badge-grace-period">Grace Period</span>;
      case "Expiring Soon": return <span className="badge badge-expiring-soon">Expiring Soon</span>;
      case "Under Review": return <span className="badge badge-under-review">Under Review</span>;
      case "Lapsed": return <span className="badge badge-lapsed">Lapsed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Policy Portfolio & Underwriting (₹)</h1>
          <p className="page-subtitle">
            Manage active insurance policies, sum insured thresholds, risk tiers, and official certifications.
          </p>
        </div>

        {(role === "admin" || role === "staff") && (
          <button className="btn btn-primary" onClick={onIssuePolicy}>
            <Plus size={16} />
            <span>Issue New Policy (₹)</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-pills">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginRight: "4px" }}>
            Line:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-pills">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginRight: "4px" }}>
            Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              className={`pill-btn ${selectedStatus === st ? "active" : ""}`}
              onClick={() => setSelectedStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Card Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>No Policies Found</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Try changing your filter options or issue a new policy.
          </p>
        </div>
      ) : (
        <div className="policy-grid">
          {filtered.map((policy) => {
            return (
              <div key={policy.id} className="policy-card">
                <div className="policy-card-header">
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div 
                      className="policy-cat-icon"
                      style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-subtle)" }}
                    >
                      {getCategoryIcon(policy.category)}
                    </div>
                    <div>
                      <div className="policy-number">{policy.policyNumber}</div>
                      <div className="policy-title">{policy.planName}</div>
                    </div>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>

                {/* Insured Person */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Insured Policyholder:</span>
                  <button
                    onClick={() => onViewCustomer && onViewCustomer(policy.customerId)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--primary-light)",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>{policy.customerName}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="policy-meta-grid">
                  <div className="policy-meta-item">
                    <span className="policy-meta-label">Sum Insured (₹)</span>
                    <span className="policy-meta-val" style={{ color: "var(--accent-cyan)" }}>
                      {formatINR(policy.coverageAmount)}
                    </span>
                  </div>
                  <div className="policy-meta-item">
                    <span className="policy-meta-label">Deductible (₹)</span>
                    <span className="policy-meta-val">
                      {formatINR(policy.deductible)}
                    </span>
                  </div>
                  <div className="policy-meta-item">
                    <span className="policy-meta-label">Premium Rate (₹)</span>
                    <span className="policy-meta-val" style={{ color: "var(--success)" }}>
                      {formatINR(policy.premiumAmount)} <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "normal" }}>/{policy.paymentFrequency}</span>
                    </span>
                  </div>
                  <div className="policy-meta-item">
                    <span className="policy-meta-label">Risk Rating</span>
                    <span className="policy-meta-val">
                      Tier {policy.riskScore || 18}
                    </span>
                  </div>
                </div>

                {/* Dates & Terms Preview */}
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>Term: {policy.startDate} to {policy.endDate}</span>
                  <span>Nominee: {policy.nominee}</span>
                </div>

                {/* Card Actions */}
                <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {policy.terms ? `${policy.terms.slice(0, 38)}...` : "Standard underwriting"}
                  </span>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenCertificate(policy)}
                    title="View & print digital insurance certificate"
                  >
                    <Download size={13} />
                    <span>Certificate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

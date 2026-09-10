import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity, 
  FilePlus, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2,
  PieChart as PieChartIcon
} from "lucide-react";
import { formatINR, formatINRCompact } from "../utils/currency";

export default function DashboardView({ 
  financeData, 
  onNavigate, 
  onOpenIssueModal, 
  onOpenFileClaimModal, 
  role 
}) {
  const kpis = financeData?.kpis || {
    totalPremiumsCollected: 0,
    totalClaimsSettled: 0,
    netOperatingCashflow: 0,
    lossRatio: 0,
    lossRatioStatus: "HEALTHY",
    totalInforceCoverage: 0,
    activePoliciesCount: 0,
    pendingClaimsCount: 0
  };

  const monthlyTrend = financeData?.monthlyTrend || [];
  const categoryBreakdown = financeData?.categoryBreakdown || [];

  const maxMonthlyVal = Math.max(
    ...monthlyTrend.map(m => Math.max(m.premiums, m.claims)),
    10000
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Financial & Risk Overview (₹ INR)</h1>
          <p className="page-subtitle">
            Consolidated Indian insurance actuarial telemetry, loss ratio metrics, and capital reserves.
          </p>
        </div>

        <div className="header-actions">
          {(role === "admin" || role === "staff") && (
            <button className="btn btn-primary" onClick={onOpenIssueModal}>
              <FilePlus size={16} />
              <span>Issue New Policy (₹)</span>
            </button>
          )}
          <button className="btn btn-secondary" onClick={onOpenFileClaimModal}>
            <AlertTriangle size={16} />
            <span>File Incident Claim</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* Total Premiums Inflow */}
        <div className="card kpi-card" style={{ "--card-accent": "var(--primary)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Gross Premiums Collected</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(79, 70, 229, 0.15)", "--icon-color": "var(--primary-light)" }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatINR(kpis.totalPremiumsCollected)}</div>
          <div className="kpi-subtext">
            <span className="kpi-trend-positive">↑ 18.2%</span>
            <span>vs previous fiscal qtr</span>
          </div>
        </div>

        {/* Total Claims Payout */}
        <div className="card kpi-card" style={{ "--card-accent": "var(--danger)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Claims Payouts Disbursed</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(239, 68, 68, 0.15)", "--icon-color": "var(--danger)" }}>
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatINR(kpis.totalClaimsSettled)}</div>
          <div className="kpi-subtext">
            <span className="kpi-trend-negative">{kpis.pendingClaimsCount} claims</span>
            <span>currently in audit</span>
          </div>
        </div>

        {/* Net Operating Margin */}
        <div className="card kpi-card" style={{ "--card-accent": "var(--success)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Net Underwriting Margin</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(16, 185, 129, 0.15)", "--icon-color": "var(--success)" }}>
              <Shield size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: kpis.netOperatingCashflow >= 0 ? "var(--success)" : "var(--danger)" }}>
            {formatINR(kpis.netOperatingCashflow)}
          </div>
          <div className="kpi-subtext">
            <span>Solvency II capital surplus</span>
          </div>
        </div>

        {/* Loss Ratio & Actuarial Health */}
        <div className="card kpi-card" style={{ "--card-accent": "var(--warning)" }}>
          <div className="kpi-header">
            <span className="kpi-title">Loss Ratio (Claims / Premiums)</span>
            <div className="kpi-icon-wrap" style={{ "--icon-bg": "rgba(245, 158, 11, 0.15)", "--icon-color": "var(--warning)" }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{kpis.lossRatio}%</span>
            <span className={`badge ${kpis.lossRatio < 60 ? "badge-active" : kpis.lossRatio < 75 ? "badge-pending" : "badge-rejected"}`} style={{ fontSize: "0.7rem" }}>
              {kpis.lossRatioStatus}
            </span>
          </div>
          <div className="kpi-subtext">
            <span>IRDAI Benchmark Target: &lt; 65%</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Exposure Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "28px" }}>
        
        {/* Monthly Cashflow Chart */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>Monthly Underwriting Cashflow (₹)</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Premium Inflow vs. Claims Outflow by Operating Month
              </p>
            </div>
            <div style={{ display: "flex", gap: "14px", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--primary-light)" }}></span>
                <span>Premiums</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--danger)" }}></span>
                <span>Claims</span>
              </div>
            </div>
          </div>

          <div className="chart-container">
            {monthlyTrend.map((m) => {
              const premiumPct = Math.min(100, Math.round((m.premiums / maxMonthlyVal) * 100));
              const claimsPct = Math.min(100, Math.round((m.claims / maxMonthlyVal) * 100));
              return (
                <div key={m.month} className="bar-chart-row">
                  <div className="bar-label">{m.month} 2024</div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill-premium" 
                      style={{ width: `${premiumPct}%` }}
                      title={`Premiums: ${formatINR(m.premiums)}`}
                    ></div>
                    <div 
                      className="bar-fill-claim" 
                      style={{ width: `${claimsPct}%` }}
                      title={`Claims: ${formatINR(m.claims)}`}
                    ></div>
                  </div>
                  <div className="bar-value">
                    <span style={{ color: "var(--primary-light)" }}>+{formatINR(m.premiums)}</span>
                    <span style={{ color: "var(--text-muted)", margin: "0 4px" }}>/</span>
                    <span style={{ color: "var(--danger)" }}>-{formatINR(m.claims)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio Line Exposure */}
        <div className="card">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>Portfolio Line Allocation</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Active policies & aggregate sum insured
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {categoryBreakdown.map((cat) => {
              const totalPolicies = kpis.totalPoliciesCount || 1;
              const share = Math.round((cat.count / totalPolicies) * 100);
              const colorMap = {
                Health: "var(--accent-cyan)",
                Auto: "var(--primary-light)",
                Life: "var(--purple)",
                Property: "var(--warning)",
                Commercial: "var(--success)"
              };
              const catColor = colorMap[cat.category] || "var(--primary)";

              return (
                <div key={cat.category} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: catColor }}></span>
                      <span>{cat.category} Insurance</span>
                    </div>
                    <div style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{cat.count}</span> policies ({share}%)
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${share}%`, background: catColor, borderRadius: "999px" }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Total Inforce Cover</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-cyan)" }}>
              {formatINRCompact(kpis.totalInforceCoverage)}
            </div>
          </div>
        </div>

      </div>

      {/* Quick Access Quick Launch Bar */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)", borderColor: "rgba(99, 102, 241, 0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={18} color="var(--primary-light)" />
              IRDAI Automated Actuarial & Audit Engine
            </h4>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              All policies, claims payouts, and premium receipts are cryptographically signed and tracked on the double-entry Indian Rupee (₹) balance ledger.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("billing")}>
              View Financial Ledger (₹)
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate("claims")}>
              Review Claims Queue ({kpis.pendingClaimsCount})
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

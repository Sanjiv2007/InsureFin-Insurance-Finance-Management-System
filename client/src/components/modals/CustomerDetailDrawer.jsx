import React, { useState, useEffect } from "react";
import { X, User, Shield, CreditCard, AlertTriangle, CheckCircle2, FilePlus, ExternalLink } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function CustomerDetailDrawer({ 
  isOpen, 
  onClose, 
  customerId, 
  onUpdateKyc, 
  onIssuePolicy,
  onOpenCertificate 
}) {
  if (!isOpen || !customerId) return null;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${customerId}`)
      .then(res => res.json())
      .then(data => {
        setCustomer(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [customerId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="brand-icon" style={{ width: "36px", height: "36px" }}>
              <User size={20} />
            </div>
            <div>
              <h2 className="modal-title">Insured Client Profile & Vault (India)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                ID: {customerId} • Actuarial Portfolio
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading || !customer ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading client portfolio...
            </div>
          ) : (
            <div>
              {/* Profile Summary Header */}
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginBottom: "20px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-light)" }}
                  />
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "800" }}>{customer.name}</h3>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {customer.occupation} • {customer.email} • {customer.phone}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Residence: {customer.address}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                    <span className={`badge badge-${customer.kycStatus.toLowerCase().replace(" ", "-")}`}>
                      {customer.kycStatus}
                    </span>
                    {customer.kycStatus !== "Verified" && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => onUpdateKyc(customer.id, "Verified")}
                      >
                        Approve KYC
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
                    CIBIL Score: <strong style={{ color: "var(--text-primary)" }}>{customer.creditScore}</strong> ({customer.riskRating} Risk)
                  </div>
                </div>
              </div>

              {/* Active Policies Section */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Shield size={16} color="var(--primary-light)" />
                    Assigned Insurance Policies ({customer.policies?.length || 0})
                  </h4>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onClose();
                      onIssuePolicy(customer.id);
                    }}
                  >
                    <FilePlus size={14} />
                    <span>Assign Policy (₹)</span>
                  </button>
                </div>

                {customer.policies?.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    No policies currently assigned to this client.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {customer.policies?.map((pol) => (
                      <div
                        key={pol.id}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{pol.planName}</div>
                          <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                            {pol.policyNumber} • {pol.category} • Sum Insured: <strong style={{ color: "var(--accent-cyan)" }}>{formatINR(pol.coverageAmount)}</strong>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: "700", color: "var(--success)", fontSize: "0.88rem" }}>
                            {formatINR(pol.premiumAmount)} / {pol.paymentFrequency}
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenCertificate(pol)}
                          >
                            Certificate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Claims History */}
              {customer.claims && customer.claims.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle size={16} color="var(--warning)" />
                    Filed Claims ({customer.claims.length})
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {customer.claims.map((clm) => (
                      <div
                        key={clm.id}
                        style={{
                          background: "rgba(0,0,0,0.2)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)",
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.85rem"
                        }}
                      >
                        <div>
                          <strong>{clm.claimNumber}</strong> — {clm.description.slice(0, 48)}...
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: "700" }}>{formatINR(clm.claimAmount)}</span>
                          <span className={`badge badge-${clm.status.toLowerCase().replace(" ", "-")}`}>
                            {clm.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

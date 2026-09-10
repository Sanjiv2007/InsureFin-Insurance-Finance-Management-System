import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  Briefcase, 
  User, 
  Shield, 
  Eye, 
  EyeOff,
  Sparkles
} from "lucide-react";

export default function LoginView({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState("admin"); // 'admin' | 'staff' | 'client'
  const [email, setEmail] = useState("admin@aegis.in");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const demoAccounts = [
    {
      role: "admin",
      title: "Executive Admin",
      name: "Vikramaditya Singhania",
      email: "admin@aegis.in",
      password: "admin123",
      designation: "Chief Risk Officer & Director",
      icon: Briefcase,
      color: "var(--primary-light)",
      description: "Full actuarial telemetry, ₹ capital ledger, loss ratio & system oversight"
    },
    {
      role: "staff",
      title: "Underwriter / Adjuster",
      name: "Ananya Deshmukh",
      email: "staff@aegis.in",
      password: "staff123",
      designation: "Senior Underwriter & Claims Officer",
      icon: UserCheck,
      color: "var(--accent-cyan)",
      description: "Underwrite policies in ₹, KYC audits, investigate claims & disburse payouts"
    },
    {
      role: "client",
      title: "Insured Policyholder",
      name: "Pooja Sharma",
      email: "client@aegis.in",
      password: "client123",
      designation: "Privilege Policyholder",
      icon: User,
      color: "var(--success)",
      description: "View ₹ policies, pay premiums via UPI/RuPay, download certificates & file claims"
    }
  ];

  const handleRoleSelect = (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setErrorMsg("");
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole })
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMsg(data.error || "Authentication failed. Please check credentials.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error connecting to Aegis Authentication gateway.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setLoading(true);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: account.role, email: account.email, password: account.password })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.user) {
          onLoginSuccess(data.user, data.token);
        } else {
          setErrorMsg(data.error || "Login failed");
        }
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
        setErrorMsg("Authentication error");
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background radial glows */}
      <div
        style={{
          position: "absolute",
          width: "550px",
          height: "550px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
          top: "10%",
          left: "20%",
          pointerEvents: "none",
          filter: "blur(40px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
          bottom: "10%",
          right: "20%",
          pointerEvents: "none",
          filter: "blur(40px)"
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: "32px",
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "var(--radius-xl)",
          padding: "40px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Left Column: Brand & 1-Click Role Switcher */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="brand-icon" style={{ width: "48px", height: "48px" }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="brand-title" style={{ fontSize: "1.45rem" }}>
                  Aegis<span>Finance</span>
                </div>
                <div className="brand-tag">Capital & Risk Core • India (₹ INR)</div>
              </div>
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", lineHeight: "1.25", marginBottom: "10px" }}>
              Enterprise Insurance & Finance Management
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "24px" }}>
              Select your role below for instant demo access, or enter your registered corporate credentials to sign in.
            </p>

            {/* 1-Click Demo Accounts Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", fontWeight: "700" }}>
                Quick 1-Click Role Access
              </div>

              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isSelected = selectedRole === acc.role;
                return (
                  <div
                    key={acc.role}
                    onClick={() => handleRoleSelect(acc)}
                    style={{
                      background: isSelected ? "rgba(79, 70, 229, 0.15)" : "rgba(255, 255, 255, 0.03)",
                      border: isSelected ? "1px solid var(--primary-light)" : "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "var(--radius-sm)",
                          background: isSelected ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isSelected ? "#ffffff" : acc.color
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          {acc.title}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                          {acc.name} • {acc.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: "0.72rem", padding: "4px 10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickDemoLogin(acc);
                      }}
                    >
                      Instant Enter
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security footnote */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <Shield size={14} color="var(--success)" />
            <span>IRDAI Regulatory Compliant • Indian Banking & UPI Integrated</span>
          </div>
        </div>

        {/* Right Column: Traditional Login Form */}
        <div
          style={{
            background: "rgba(11, 17, 32, 0.6)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "4px" }}>
              Sign In to Your Account
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Accessing role: <strong style={{ color: "var(--primary-light)", textTransform: "uppercase" }}>{selectedRole}</strong>
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                background: "var(--danger-surface)",
                border: "1px solid var(--danger)",
                color: "#f87171",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                marginBottom: "16px"
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: "38px" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@aegis.in"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  style={{ paddingLeft: "38px", paddingRight: "38px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked />
                <span>Remember session</span>
              </label>
              <span style={{ color: "var(--primary-light)", cursor: "pointer" }}>
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating with Aegis Core...</span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Enter {selectedRole.toUpperCase()} Workspace</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Need help? Contact Aegis IT Helpdesk: <strong style={{ color: "var(--text-secondary)" }}>it-support@aegis.in</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

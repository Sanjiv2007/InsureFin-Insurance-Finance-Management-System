import React, { useState } from "react";
import { X, CreditCard, Landmark, QrCode, Lock, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";
import confetti from "canvas-confetti";
import { formatINR } from "../../utils/currency";

export default function PayPremiumModal({ isOpen, onClose, invoice, onPaymentSuccess }) {
  if (!isOpen || !invoice) return null;

  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState("pooja@oksbi");
  const [cardNumber, setCardNumber] = useState("6521 •••• •••• 4482");
  const [cardHolder, setCardHolder] = useState(invoice.customerName || "Pooja Sharma");
  const [expiry, setExpiry] = useState("09/29");
  const [cvv, setCvv] = useState("418");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [processing, setProcessing] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);

    let methodLabel = "";
    if (paymentMethod === "upi") {
      methodLabel = `UPI (Instant Clearing / ${upiId})`;
    } else if (paymentMethod === "card") {
      methodLabel = `RuPay Debit/Credit Card ending ${cardNumber.slice(-4)}`;
    } else {
      methodLabel = `NetBanking (${selectedBank} Bank)`;
    }

    try {
      const res = await fetch(`/api/payments/${invoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: methodLabel })
      });

      if (res.ok) {
        const data = await res.json();
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {}
        onPaymentSuccess(data.payment, data.receipt);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Payment transaction failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting Indian payment gateway");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="brand-icon" style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h2 className="modal-title">Premium Checkout (₹ INR)</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                NPCI / RBI Authorized Gateway
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePay}>
          <div className="modal-body">
            {/* Invoice Summary Pill */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Invoice: {invoice.invoiceNumber}
                </div>
                <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  {invoice.policyNumber}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  Policyholder: {invoice.customerName}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>Total Due (₹)</div>
                <div style={{ fontSize: "1.45rem", fontWeight: "800", color: "var(--success)" }}>
                  {formatINR(invoice.amount)}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                className={`card ${paymentMethod === "upi" ? "active" : ""}`}
                style={{
                  padding: "12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  borderColor: paymentMethod === "upi" ? "var(--primary-light)" : "var(--border-subtle)",
                  background: paymentMethod === "upi" ? "rgba(99, 102, 241, 0.15)" : "var(--bg-input)"
                }}
                onClick={() => setPaymentMethod("upi")}
              >
                <Smartphone size={20} color={paymentMethod === "upi" ? "var(--primary-light)" : "var(--text-muted)"} />
                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>UPI (GPay/PhonePe)</span>
              </button>

              <button
                type="button"
                className={`card ${paymentMethod === "card" ? "active" : ""}`}
                style={{
                  padding: "12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  borderColor: paymentMethod === "card" ? "var(--primary-light)" : "var(--border-subtle)",
                  background: paymentMethod === "card" ? "rgba(99, 102, 241, 0.15)" : "var(--bg-input)"
                }}
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard size={20} color={paymentMethod === "card" ? "var(--primary-light)" : "var(--text-muted)"} />
                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>RuPay / Cards</span>
              </button>

              <button
                type="button"
                className={`card ${paymentMethod === "netbanking" ? "active" : ""}`}
                style={{
                  padding: "12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  borderColor: paymentMethod === "netbanking" ? "var(--primary-light)" : "var(--border-subtle)",
                  background: paymentMethod === "netbanking" ? "rgba(99, 102, 241, 0.15)" : "var(--bg-input)"
                }}
                onClick={() => setPaymentMethod("netbanking")}
              >
                <Landmark size={20} color={paymentMethod === "netbanking" ? "var(--primary-light)" : "var(--text-muted)"} />
                <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>NetBanking</span>
              </button>
            </div>

            {/* UPI Option */}
            {paymentMethod === "upi" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobilenumber@upi or name@okhdfcbank"
                    required
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "var(--radius-md)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <QrCode size={20} color="var(--accent-cyan)" />
                  <span>Instant UPI Intent supported across Google Pay, PhonePe, Paytm, and CRED.</span>
                </div>
              </div>
            )}

            {/* RuPay / Card Option */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Cardholder Name (as printed on card)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">RuPay / Debit / Credit Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV (3 Digits)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NetBanking Option */}
            {paymentMethod === "netbanking" && (
              <div className="form-group">
                <label className="form-label">Select Bank</label>
                <select
                  className="form-control"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="HDFC">HDFC Bank</option>
                  <option value="SBI">State Bank of India (SBI)</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="Kotak">Kotak Mahindra Bank</option>
                  <option value="Punjab National">Punjab National Bank (PNB)</option>
                </select>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                  Instant two-factor OTP verification simulated on checkout.
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", justifyContent: "center" }}>
              <Lock size={12} />
              <span>RBI Guidelines Compliant • 256-Bit TLS Tokenized</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success" disabled={processing}>
              {processing ? "Authorizing with Bank..." : `Authorize & Pay ${formatINR(invoice.amount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

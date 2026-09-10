import React from "react";
import { X, Receipt, Printer } from "lucide-react";
import { formatINR } from "../../utils/currency";

export default function ReceiptModal({ isOpen, onClose, data, type = "payment" }) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPayment = type === "payment";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Receipt size={20} color="var(--success)" />
            <h2 className="modal-title">
              {isPayment ? "Official Premium Tax Invoice" : "Settlement Payout Voucher"}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="receipt-card">
            <div className="receipt-header">
              <div style={{ fontWeight: "900", letterSpacing: "0.08em", color: "#4338ca", fontSize: "1.15rem" }}>
                AEGIS INDIA GENERAL INSURANCE
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase" }}>
                GSTIN: 27AAACA1234F1Z8 • IRDAI Reg 162
              </div>
              <div className="receipt-stamp">
                {isPayment ? "PAID IN FULL" : "SETTLED & DISBURSED"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Receipt / Ref ID:</span>
                <strong style={{ fontFamily: "monospace" }}>
                  {data.receiptNumber || data.transactionRef || data.claimNumber || "RCP-982103"}
                </strong>
              </div>

              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Policy Number:</span>
                <strong>{data.policyNumber}</strong>
              </div>

              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>{isPayment ? "Payer / Insured:" : "Beneficiary:"}</span>
                <strong>{data.customerName || data.beneficiary}</strong>
              </div>

              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Date & Time:</span>
                <span>{data.paymentDate || data.disbursementDate || new Date().toISOString().split("T")[0]}</span>
              </div>

              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Channel / Method:</span>
                <span>{data.paymentMethod || "UPI / Immediate Payment Service (IMPS)"}</span>
              </div>

              <div className="receipt-row">
                <span style={{ color: "#64748b" }}>Authorization Status:</span>
                <span style={{ color: "#059669", fontWeight: "700" }}>COMPLETED / 200 OK</span>
              </div>

              <div className="receipt-total">
                <span>{isPayment ? "Total Premium (incl. GST 18%)" : "Total Settlement Payout"}:</span>
                <span style={{ color: isPayment ? "#059669" : "#4338ca" }}>
                  {formatINR(data.amountPaid || data.settlementAmount || data.amount || 0)}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.72rem", color: "#94a3b8" }}>
              Thank you for trusting Aegis India. Retain this official receipt for tax deduction under Section 80D / 80C of the Income Tax Act.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

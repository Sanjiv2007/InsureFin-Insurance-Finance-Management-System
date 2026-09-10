import express from "express";
import { db } from "../data/store.js";

const router = express.Router();

// GET all payments / invoices
router.get("/", (req, res) => {
  const { status, policyId, customerId } = req.query;
  let result = [...db.payments];

  if (status && status !== "All") {
    result = result.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (policyId) {
    result = result.filter(p => p.policyId === policyId);
  }

  if (customerId) {
    result = result.filter(p => p.customerId === customerId);
  }

  res.json(result);
});

// POST process payment for an invoice
router.post("/:id/pay", (req, res) => {
  const payment = db.payments.find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: "Invoice/Payment record not found" });
  }

  if (payment.status === "Paid") {
    return res.status(400).json({ error: "Invoice is already paid in full" });
  }

  const { paymentMethod } = req.body;
  const methodUsed = paymentMethod || "Credit Card (Instant Checkout)";
  const now = new Date().toISOString().split("T")[0];
  const txnRef = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

  payment.status = "Paid";
  payment.paidDate = now;
  payment.paymentMethod = methodUsed;
  payment.transactionRef = txnRef;

  // If policy was in Grace Period, restore to Active
  const policy = db.policies.find(p => p.id === payment.policyId);
  if (policy && policy.status === "Grace Period") {
    policy.status = "Active";
  }

  // Record INFLOW in double-entry ledger
  const currentBalance = db.ledger.length > 0 ? db.ledger[db.ledger.length - 1].balanceAfter : 0;
  const newBalance = currentBalance + payment.amount;

  const ledgerEntry = {
    id: `led-${Date.now()}`,
    date: now,
    type: "INFLOW",
    category: "Premium Payment",
    description: `Premium Receipt: ${payment.policyNumber} (${payment.customerName})`,
    amount: payment.amount,
    referenceId: payment.id,
    balanceAfter: newBalance
  };

  db.ledger.push(ledgerEntry);

  res.json({
    message: "Payment processed successfully",
    payment,
    receipt: {
      receiptNumber: `RCP-${txnRef.replace("TXN-", "")}`,
      policyNumber: payment.policyNumber,
      customerName: payment.customerName,
      amountPaid: payment.amount,
      paymentMethod: methodUsed,
      transactionRef: txnRef,
      paymentDate: now,
      status: "COMPLETED"
    }
  });
});

// POST create custom premium invoice
router.post("/create", (req, res) => {
  const { policyId, amount, dueDate } = req.body;
  const policy = db.policies.find(p => p.id === policyId);
  if (!policy) {
    return res.status(400).json({ error: "Policy not found" });
  }

  const currentYear = new Date().getFullYear();
  const invoice = {
    id: `pmt-${Date.now()}`,
    invoiceNumber: `INV-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
    policyId: policy.id,
    policyNumber: policy.policyNumber,
    customerId: policy.customerId,
    customerName: policy.customerName,
    amount: Number(amount) || policy.premiumAmount,
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    paidDate: null,
    paymentMethod: "Pending Selection",
    status: "Pending",
    transactionRef: null
  };

  db.payments.unshift(invoice);
  res.status(201).json(invoice);
});

export default router;

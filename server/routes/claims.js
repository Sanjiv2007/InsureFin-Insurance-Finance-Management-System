import express from "express";
import { db } from "../data/store.js";

const router = express.Router();

// GET all claims with filtering
router.get("/", (req, res) => {
  const { status, category, customerId, search } = req.query;
  let result = [...db.claims];

  if (status && status !== "All") {
    result = result.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  if (category && category !== "All") {
    result = result.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  if (customerId) {
    result = result.filter(c => c.customerId === customerId);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      c =>
        c.claimNumber.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.policyNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// GET claim by ID
router.get("/:id", (req, res) => {
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }

  const policy = db.policies.find(p => p.id === claim.policyId);
  const customer = db.customers.find(c => c.id === claim.customerId);

  res.json({
    ...claim,
    policy,
    customer
  });
});

// POST submit new claim
router.post("/", (req, res) => {
  const {
    policyId,
    incidentDate,
    claimAmount,
    description,
    incidentLocation,
    evidencePhotos
  } = req.body;

  const policy = db.policies.find(p => p.id === policyId);
  if (!policy) {
    return res.status(400).json({ error: "Linked policy not found" });
  }

  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const claimNumber = `CLM-${currentYear}-${randomSuffix}`;
  const now = new Date().toISOString().split("T")[0];

  const newClaim = {
    id: `clm-${Date.now()}`,
    claimNumber,
    policyId: policy.id,
    policyNumber: policy.policyNumber,
    customerId: policy.customerId,
    customerName: policy.customerName,
    category: policy.category,
    incidentDate: incidentDate || now,
    filedDate: now,
    claimAmount: Number(claimAmount) || 1000,
    approvedAmount: null,
    description: description || "Claim filed for incident inspection and compensation.",
    incidentLocation: incidentLocation || "Registered Policy Address",
    evidencePhotos: Array.isArray(evidencePhotos) && evidencePhotos.length > 0
      ? evidencePhotos
      : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80"],
    status: "Submitted",
    adjusterNotes: "New claim submitted. Awaiting assessment triage.",
    adjusterName: "Unassigned",
    settlementDate: null
  };

  db.claims.unshift(newClaim);
  res.status(201).json(newClaim);
});

// PATCH assign claim to adjuster & move to "Under Review"
router.patch("/:id/assign", (req, res) => {
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }

  const { adjusterName, notes } = req.body;
  claim.adjusterName = adjusterName || "Sarah Jenkins, Senior Field Adjuster";
  claim.status = "Under Review";
  if (notes) {
    claim.adjusterNotes = notes;
  }

  res.json(claim);
});

// POST adjudicate claim (Approve & Settle or Reject)
router.post("/:id/adjudicate", (req, res) => {
  const claim = db.claims.find(c => c.id === req.params.id);
  if (!claim) {
    return res.status(404).json({ error: "Claim not found" });
  }

  const { decision, approvedAmount, notes, adjusterName } = req.body;
  const now = new Date().toISOString().split("T")[0];

  if (decision === "Approve") {
    const payout = Number(approvedAmount) || claim.claimAmount;
    claim.status = "Settled";
    claim.approvedAmount = payout;
    claim.settlementDate = now;
    claim.adjusterNotes = notes || "Claim investigated and verified against policy terms. Settlement payout disbursed to policyholder designated bank account.";
    if (adjusterName) claim.adjusterName = adjusterName;

    // Record OUTFLOW in double-entry ledger
    const currentBalance = db.ledger.length > 0 ? db.ledger[db.ledger.length - 1].balanceAfter : 0;
    const newBalance = currentBalance - payout;

    const ledgerEntry = {
      id: `led-${Date.now()}`,
      date: now,
      type: "OUTFLOW",
      category: "Claim Settlement",
      description: `Claim Settlement Payout: ${claim.claimNumber} (${claim.customerName})`,
      amount: payout,
      referenceId: claim.id,
      balanceAfter: newBalance
    };

    db.ledger.push(ledgerEntry);

    return res.json({
      message: "Claim approved and settlement disbursed",
      claim,
      payoutReceipt: {
        claimNumber: claim.claimNumber,
        policyNumber: claim.policyNumber,
        beneficiary: claim.customerName,
        settlementAmount: payout,
        disbursementDate: now,
        status: "DISBURSED"
      }
    });
  } else if (decision === "Reject") {
    claim.status = "Rejected";
    claim.approvedAmount = 0;
    claim.settlementDate = now;
    claim.adjusterNotes = notes || "Claim formally declined following adjuster inspection. Incident falls outside policy exclusions.";
    if (adjusterName) claim.adjusterName = adjusterName;

    return res.json({
      message: "Claim rejected with official reason recorded",
      claim
    });
  } else {
    return res.status(400).json({ error: "Invalid decision. Must be 'Approve' or 'Reject'." });
  }
});

export default router;

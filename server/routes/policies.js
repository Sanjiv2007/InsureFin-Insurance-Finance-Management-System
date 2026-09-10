import express from "express";
import { db } from "../data/store.js";

const router = express.Router();

// GET all policies with optional filters
router.get("/", (req, res) => {
  const { category, status, customerId, search } = req.query;
  let result = [...db.policies];

  if (category && category !== "All") {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (status && status !== "All") {
    result = result.filter(p => p.status.toLowerCase() === status.toLowerCase());
  }

  if (customerId) {
    result = result.filter(p => p.customerId === customerId);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      p =>
        p.policyNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.planName.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// GET single policy
router.get("/:id", (req, res) => {
  const policy = db.policies.find(p => p.id === req.params.id);
  if (!policy) {
    return res.status(404).json({ error: "Policy not found" });
  }

  const customer = db.customers.find(c => c.id === policy.customerId);
  const policyPayments = db.payments.filter(pmt => pmt.policyId === policy.id);
  const policyClaims = db.claims.filter(c => c.policyId === policy.id);

  res.json({
    ...policy,
    customer,
    payments: policyPayments,
    claims: policyClaims
  });
});

// POST create/issue new policy
router.post("/", (req, res) => {
  const {
    customerId,
    category,
    planName,
    coverageAmount,
    deductible,
    premiumAmount,
    paymentFrequency,
    nominee,
    terms
  } = req.body;

  const customer = db.customers.find(c => c.id === customerId);
  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }

  const categoryPrefix = category ? category.substring(0, 3).toUpperCase() : "GEN";
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const currentYear = new Date().getFullYear();
  const policyNumber = `POL-${categoryPrefix}-${currentYear}-${randomSuffix}`;
  const newId = `pol-${Date.now()}`;

  const startDate = new Date().toISOString().split("T")[0];
  const endDateObj = new Date();
  endDateObj.setFullYear(endDateObj.getFullYear() + 1);
  const endDate = endDateObj.toISOString().split("T")[0];

  const newPolicy = {
    id: newId,
    policyNumber,
    customerId: customer.id,
    customerName: customer.name,
    category: category || "Health",
    planName: planName || "Custom Standard Coverage",
    coverageAmount: Number(coverageAmount) || 100000,
    deductible: Number(deductible) || 1000,
    premiumAmount: Number(premiumAmount) || 250,
    paymentFrequency: paymentFrequency || "Monthly",
    startDate,
    endDate,
    status: "Active",
    nominee: nominee || "Self / Estate",
    riskScore: Math.floor(Math.random() * 30) + 15,
    terms: terms || "Standard coverage subject to underwriting inspection and verified claim proof."
  };

  db.policies.unshift(newPolicy);

  // Generate initial pending payment invoice for this policy
  const invoiceNumber = `INV-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
  const initialInvoice = {
    id: `pmt-${Date.now()}`,
    invoiceNumber,
    policyId: newPolicy.id,
    policyNumber: newPolicy.policyNumber,
    customerId: customer.id,
    customerName: customer.name,
    amount: newPolicy.premiumAmount,
    dueDate: startDate,
    paidDate: null,
    paymentMethod: "Pending Selection",
    status: "Pending",
    transactionRef: null
  };

  db.payments.unshift(initialInvoice);

  res.status(201).json(newPolicy);
});

// PATCH policy status (e.g., Renew, Cancel, Update)
router.patch("/:id", (req, res) => {
  const policyIndex = db.policies.findIndex(p => p.id === req.params.id);
  if (policyIndex === -1) {
    return res.status(404).json({ error: "Policy not found" });
  }

  const { status, coverageAmount, terms } = req.body;
  if (status) db.policies[policyIndex].status = status;
  if (coverageAmount) db.policies[policyIndex].coverageAmount = Number(coverageAmount);
  if (terms) db.policies[policyIndex].terms = terms;

  res.json(db.policies[policyIndex]);
});

export default router;

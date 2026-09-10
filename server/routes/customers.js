import express from "express";
import { db } from "../data/store.js";

const router = express.Router();

// GET all customers with their active policies summary
router.get("/", (req, res) => {
  const { search, kycStatus } = req.query;
  let result = [...db.customers];

  if (kycStatus && kycStatus !== "All") {
    result = result.filter(c => c.kycStatus.toLowerCase() === kycStatus.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }

  const enriched = result.map(cust => {
    const custPolicies = db.policies.filter(p => p.customerId === cust.id);
    const custClaims = db.claims.filter(c => c.customerId === cust.id);
    const custPayments = db.payments.filter(pmt => pmt.customerId === cust.id);
    const totalInforce = custPolicies
      .filter(p => p.status === "Active")
      .reduce((sum, p) => sum + p.coverageAmount, 0);

    return {
      ...cust,
      policyCount: custPolicies.length,
      activePolicyCount: custPolicies.filter(p => p.status === "Active").length,
      totalCoverage: totalInforce,
      claimsCount: custClaims.length,
      paymentsCount: custPayments.length
    };
  });

  res.json(enriched);
});

// GET single customer profile with comprehensive history
router.get("/:id", (req, res) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const customerPolicies = db.policies.filter(p => p.customerId === customer.id);
  const customerClaims = db.claims.filter(c => c.customerId === customer.id);
  const customerPayments = db.payments.filter(p => p.customerId === customer.id);

  res.json({
    ...customer,
    policies: customerPolicies,
    claims: customerClaims,
    payments: customerPayments
  });
});

// POST register new customer
router.post("/", (req, res) => {
  const { name, email, phone, address, occupation, annualIncome, creditScore } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newCustomer = {
    id: `cust-${Date.now()}`,
    name,
    email,
    phone: phone || "+1 (555) 000-0000",
    address: address || "Not provided",
    creditScore: Number(creditScore) || 720,
    riskRating: Number(creditScore) > 750 ? "Low" : Number(creditScore) > 650 ? "Medium" : "High",
    kycStatus: "Pending",
    occupation: occupation || "Professional",
    annualIncome: Number(annualIncome) || 85000,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    joinedDate: new Date().toISOString().split("T")[0]
  };

  db.customers.unshift(newCustomer);
  res.status(201).json(newCustomer);
});

// PATCH KYC verification status
router.patch("/:id/kyc", (req, res) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  const { kycStatus } = req.body;
  if (!["Verified", "Pending", "Action Required"].includes(kycStatus)) {
    return res.status(400).json({ error: "Invalid KYC status" });
  }

  customer.kycStatus = kycStatus;
  res.json(customer);
});

export default router;

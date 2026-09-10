import express from "express";
import { db } from "../data/store.js";

const router = express.Router();

// GET executive financial overview and KPI metrics
router.get("/overview", (req, res) => {
  const paidPayments = db.payments.filter(p => p.status === "Paid");
  const totalPremiumsCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  const settledClaims = db.claims.filter(c => c.status === "Settled");
  const totalClaimsSettled = settledClaims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

  const pendingClaims = db.claims.filter(c => ["Submitted", "Under Review"].includes(c.status));
  const totalPendingClaimsValue = pendingClaims.reduce((sum, c) => sum + c.claimAmount, 0);

  const activePolicies = db.policies.filter(p => p.status === "Active");
  const totalInforceCoverage = activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
  const totalAnnualizedInforcePremium = activePolicies.reduce((sum, p) => {
    return sum + (p.paymentFrequency === "Monthly" ? p.premiumAmount * 12 : p.premiumAmount);
  }, 0);

  const netOperatingCashflow = totalPremiumsCollected - totalClaimsSettled;
  const lossRatio = totalPremiumsCollected > 0 
    ? Number(((totalClaimsSettled / totalPremiumsCollected) * 100).toFixed(1))
    : 0;

  // Monthly breakdown for financial trends (in INR)
  const monthlyData = [
    { month: "Apr", premiums: 75000, claims: 22000, margin: 53000 },
    { month: "May", premiums: 92000, claims: 34000, margin: 58000 },
    { month: "Jun", premiums: 108000, claims: 18500, margin: 89500 },
    { month: "Jul", premiums: 115000, claims: 45000, margin: 70000 },
    { month: "Aug", premiums: 128000, claims: 75000, margin: 53000 },
    { month: "Sep", premiums: totalPremiumsCollected, claims: totalClaimsSettled, margin: netOperatingCashflow }
  ];

  // Category breakdown
  const categoryStats = ["Health", "Auto", "Life", "Property", "Commercial"].map(cat => {
    const catPolicies = db.policies.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    const catClaims = db.claims.filter(c => c.category.toLowerCase() === cat.toLowerCase());
    const totalCover = catPolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
    const catPaidClaims = catClaims
      .filter(c => c.status === "Settled")
      .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

    return {
      category: cat,
      count: catPolicies.length,
      totalCoverage: totalCover,
      claimsCount: catClaims.length,
      settledClaimsAmount: catPaidClaims
    };
  });

  res.json({
    kpis: {
      totalPremiumsCollected,
      totalClaimsSettled,
      totalPendingClaimsValue,
      netOperatingCashflow,
      lossRatio,
      lossRatioStatus: lossRatio < 60 ? "HEALTHY" : lossRatio < 75 ? "MODERATE" : "HIGH_RISK",
      totalInforceCoverage,
      totalAnnualizedInforcePremium,
      activePoliciesCount: activePolicies.length,
      totalPoliciesCount: db.policies.length,
      pendingClaimsCount: pendingClaims.length,
      totalCustomersCount: db.customers.length
    },
    monthlyTrend: monthlyData,
    categoryBreakdown: categoryStats
  });
});

// GET full financial ledger
router.get("/ledger", (req, res) => {
  // Return ledger sorted descending by date/id
  const sortedLedger = [...db.ledger].reverse();
  res.json(sortedLedger);
});

export default router;

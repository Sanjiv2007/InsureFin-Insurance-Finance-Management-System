import express from "express";
import { db } from "../data/store.js";

const router = express.Router();

// POST login endpoint supporting Admin, Staff, and Client
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  // Support direct demo login by role if requested
  let user;
  if (role && !email) {
    user = db.users.find(u => u.role.toLowerCase() === role.toLowerCase());
  } else if (email) {
    user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && password && user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials. Check email and password." });
    }
  }

  if (!user) {
    // If client email doesn't exist in users, check customers
    const customer = db.customers.find(c => c.email.toLowerCase() === email?.toLowerCase());
    if (customer) {
      user = {
        id: `usr-${customer.id}`,
        customerId: customer.id,
        name: customer.name,
        email: customer.email,
        role: "client",
        designation: "Policyholder",
        avatar: customer.avatar
      };
    } else {
      return res.status(401).json({ error: "Account not found for provided credentials." });
    }
  }

  // Create simulated secure auth token
  const token = `aegis-auth-${user.role}-${Date.now()}`;

  res.json({
    message: `Welcome, ${user.name}`,
    token,
    user: {
      id: user.id,
      customerId: user.customerId || null,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      avatar: user.avatar
    }
  });
});

// GET demo accounts for instant 1-click preview
router.get("/demo-accounts", (req, res) => {
  const accounts = db.users.map(u => ({
    role: u.role,
    name: u.name,
    email: u.email,
    password: u.password,
    designation: u.designation,
    avatar: u.avatar
  }));
  res.json(accounts);
});

export default router;

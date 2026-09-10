import express from "express";
import cors from "cors";

import authRouter from "./routes/auth.js";
import policiesRouter from "./routes/policies.js";
import customersRouter from "./routes/customers.js";
import paymentsRouter from "./routes/payments.js";
import claimsRouter from "./routes/claims.js";
import financeRouter from "./routes/finance.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Aegis Insurance & Finance Management API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register routers
app.use("/api/auth", authRouter);
app.use("/api/policies", policiesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/claims", claimsRouter);
app.use("/api/finance", financeRouter);

// Serve static build if available
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
      if (err) {
        res.status(404).send("Development mode: Run Vite dev server or build client.");
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Aegis Backend] Insurance & Finance Management Server running on port ${PORT}`);
});

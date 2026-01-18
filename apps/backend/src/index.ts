import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import simulateRoute from "./api/simulate.route";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", simulateRoute);

// Root health check
app.get("/", (_, res) => {
  res.json({
    name: "Transaction Simulator API",
    version: "1.0.0",
    endpoints: {
      simulate: "POST /api/simulate",
      health: "GET /api/health",
    },
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║       Transaction Simulator API                ║
  ╠════════════════════════════════════════════════╣
  ║  Server running on http://localhost:${PORT}       ║
  ║  Health check: GET /api/health                 ║
  ║  Simulate: POST /api/simulate                  ║
  ╚════════════════════════════════════════════════╝
  `);
});

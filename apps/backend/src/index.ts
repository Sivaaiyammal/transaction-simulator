import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import simulateRoute from "./api/simulate.route";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - restrict origins in production
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 30 : 100, // 30 req/min in production
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors(corsOptions));
app.use(limiter);
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

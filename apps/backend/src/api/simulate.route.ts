import { Router, Request, Response } from "express";
import { simulateTx } from "../core/simulateTx";
import {
  validateSimulationRequest,
  ValidationError,
} from "../utils/validation";
import { SimulationResult, ApiResponse } from "../types/simulation";

const router = Router();

/**
 * POST /api/simulate
 *
 * Simulate an Ethereum transaction without sending it on-chain.
 *
 * Request body:
 * {
 *   from: string      - Sender address (required)
 *   to: string        - Recipient/contract address (required)
 *   value?: string    - Amount in wei (optional, default: "0x0")
 *   data?: string     - Transaction calldata (optional, default: "0x")
 *   gasLimit?: string - Gas limit (optional)
 *   blockTag?: string - Block tag: "latest", "pending", or block number
 * }
 *
 * Response:
 * {
 *   result?: SimulationResult  - Simulation result on success
 *   error?: ApiError           - Error details on failure
 * }
 */
router.post(
  "/simulate",
  async (
    req: Request,
    res: Response<ApiResponse<SimulationResult>>
  ): Promise<void> => {
    try {
      // Validate and normalize input
      const validated = validateSimulationRequest(req.body);

      // Run simulation
      const result = await simulateTx(validated);

      res.json({ result });
    } catch (err) {
      // Handle validation errors
      if (err instanceof ValidationError) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: err.message,
            field: err.field,
          },
        });
        return;
      }

      // Handle unexpected errors
      if (err instanceof Error) {
        console.error("Simulation error:", err);
        res.status(500).json({
          error: {
            code: "SIMULATION_ERROR",
            message: "An unexpected error occurred during simulation",
          },
        });
        return;
      }

      // Unknown error type
      res.status(500).json({
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      });
    }
  }
);

/**
 * GET /api/health
 *
 * Health check endpoint for the simulation API
 */
router.get("/health", (_req: Request, res: Response): void => {
  res.json({
    status: "ok",
    service: "transaction-simulator",
    timestamp: new Date().toISOString(),
  });
});

export default router;

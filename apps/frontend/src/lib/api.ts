import type { SimulationRequest, SimulationResult, ApiResponse } from "../types/simulation";

const API_BASE = "/api";

/**
 * Simulate a transaction via the backend API
 */
export async function simulateTransaction(
  request: SimulationRequest
): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data: ApiResponse<SimulationResult> = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || "Simulation failed");
  }

  if (!data.result) {
    throw new Error("No result returned from simulation");
  }

  return data.result;
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

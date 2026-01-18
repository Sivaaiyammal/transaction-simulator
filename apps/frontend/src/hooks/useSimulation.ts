import { useMutation } from "@tanstack/react-query";
import { simulateTransaction } from "../lib/api";
import type { SimulationRequest, SimulationResult } from "../types/simulation";

/**
 * Hook for simulating transactions
 */
export function useSimulation() {
  return useMutation<SimulationResult, Error, SimulationRequest>({
    mutationFn: simulateTransaction,
  });
}

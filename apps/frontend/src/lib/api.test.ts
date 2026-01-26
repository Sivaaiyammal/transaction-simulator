import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { simulateTransaction, checkHealth } from "./api";

describe("API functions", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("simulateTransaction", () => {
    const validRequest = {
      from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab2d",
      to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: "0x0",
      data: "0x",
    };

    it("should return simulation result on success", async () => {
      const mockResult = {
        success: true,
        gasEstimate: "21000",
        returnData: "0x",
        ethTransfer: null,
        tokenTransfers: [],
        approvalChanges: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: mockResult }),
      });

      const result = await simulateTransaction(validRequest);

      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validRequest),
      });
    });

    it("should throw error on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "Validation failed" } }),
      });

      await expect(simulateTransaction(validRequest)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should throw error when result is missing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(simulateTransaction(validRequest)).rejects.toThrow(
        "No result returned from simulation"
      );
    });

    it("should throw default error when no message provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: {} }),
      });

      await expect(simulateTransaction(validRequest)).rejects.toThrow(
        "Simulation failed"
      );
    });
  });

  describe("checkHealth", () => {
    it("should return true when API is healthy", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await checkHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith("/api/health");
    });

    it("should return false when API returns error", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const result = await checkHealth();

      expect(result).toBe(false);
    });

    it("should return false when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await checkHealth();

      expect(result).toBe(false);
    });
  });
});

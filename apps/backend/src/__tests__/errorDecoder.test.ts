import { decodeError, extractErrorData, getErrorSummary } from "../core/errorDecoder";

describe("decodeError", () => {
  describe("empty or missing error data", () => {
    it("should handle undefined error data", () => {
      const result = decodeError(undefined);

      expect(result.type).toBe("unknown");
      expect(result.message).toBe("Transaction failed");
    });

    it("should handle null error data", () => {
      const result = decodeError(null);

      expect(result.type).toBe("unknown");
      expect(result.message).toBe("Transaction failed");
    });

    it("should handle empty hex string", () => {
      const result = decodeError("0x");

      expect(result.type).toBe("unknown");
      expect(result.message).toBe("Transaction failed");
    });

    it("should handle short data (< 10 chars)", () => {
      const result = decodeError("0x1234");

      expect(result.type).toBe("unknown");
    });
  });

  describe("Error(string) decoding - selector 0x08c379a0", () => {
    it("should decode 'transfer amount exceeds balance' error", () => {
      // Error(string) with "transfer amount exceeds balance"
      // Properly ABI-encoded string
      const errorData =
        "0x08c379a0" + // Error(string) selector
        "0000000000000000000000000000000000000000000000000000000000000020" + // offset to string
        "0000000000000000000000000000000000000000000000000000000000000020" + // string length (32)
        "7472616e7366657220616d6f756e7420657863656564732062616c616e636500"; // "transfer amount exceeds balance"

      const result = decodeError(errorData);

      expect(result.type).toBe("revert");
      expect(result.message).toBe("Insufficient Balance");
      expect(result.userMessage).toContain("balance");
    });

    it("should decode 'insufficient allowance' error", () => {
      // Error(string) with "ERC20: insufficient allowance"
      const errorData =
        "0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000184552433230203a20696e73756666696369656e7420616c6c6f77616e63650000";

      const result = decodeError(errorData);

      expect(result.type).toBe("revert");
    });
  });

  describe("Panic(uint256) decoding - selector 0x4e487b71", () => {
    it("should decode arithmetic overflow panic (0x11)", () => {
      // Panic(uint256) with code 0x11
      const errorData =
        "0x4e487b710000000000000000000000000000000000000000000000000000000000000011";

      const result = decodeError(errorData);

      expect(result.type).toBe("panic");
      expect(result.message).toBe("Arithmetic overflow or underflow");
      expect(result.panicCode).toBe(0x11);
    });

    it("should decode division by zero panic (0x12)", () => {
      // Panic(uint256) with code 0x12
      const errorData =
        "0x4e487b710000000000000000000000000000000000000000000000000000000000000012";

      const result = decodeError(errorData);

      expect(result.type).toBe("panic");
      expect(result.message).toBe("Division by zero");
      expect(result.panicCode).toBe(0x12);
    });

    it("should decode array out of bounds panic (0x32)", () => {
      // Panic(uint256) with code 0x32
      const errorData =
        "0x4e487b710000000000000000000000000000000000000000000000000000000000000032";

      const result = decodeError(errorData);

      expect(result.type).toBe("panic");
      expect(result.message).toBe("Array index out of bounds");
      expect(result.panicCode).toBe(0x32);
    });

    it("should handle unknown panic code", () => {
      // Panic(uint256) with unknown code 0x99
      const errorData =
        "0x4e487b710000000000000000000000000000000000000000000000000000000000000099";

      const result = decodeError(errorData);

      expect(result.type).toBe("panic");
      expect(result.panicCode).toBe(0x99);
    });
  });

  describe("Known custom error selectors", () => {
    it("should decode ERC20InsufficientBalance (0xe450d38c)", () => {
      const errorData =
        "0xe450d38c00000000000000000000000074d35cc6634c0532925a3b844bc9e7595f0ab2d00000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000001bc16d674ec80000";

      const result = decodeError(errorData);

      expect(result.type).toBe("custom");
      expect(result.message).toBe("Insufficient Token Balance");
      expect(result.selector).toBe("0xe450d38c");
    });

    it("should decode ERC20InsufficientAllowance (0xfb8f41b2)", () => {
      const errorData =
        "0xfb8f41b2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000001bc16d674ec80000";

      const result = decodeError(errorData);

      expect(result.type).toBe("custom");
      expect(result.message).toBe("Approval Required");
    });

    it("should decode OwnableUnauthorizedAccount (0x118cdaa7)", () => {
      const errorData =
        "0x118cdaa700000000000000000000000074d35cc6634c0532925a3b844bc9e7595f0ab2d";

      const result = decodeError(errorData);

      expect(result.type).toBe("custom");
      expect(result.message).toBe("Not Authorized");
    });

    it("should decode EnforcedPause (0xe07c8dba)", () => {
      const errorData = "0xe07c8dba";

      const result = decodeError(errorData);

      expect(result.type).toBe("custom");
      expect(result.message).toBe("Contract Paused");
    });
  });

  describe("unknown custom errors", () => {
    it("should return generic message for unknown selector", () => {
      const errorData =
        "0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001";

      const result = decodeError(errorData);

      expect(result.type).toBe("custom");
      expect(result.message).toBe("Contract Error");
      expect(result.selector).toBe("0xdeadbeef");
    });
  });
});

describe("extractErrorData", () => {
  it("should return null for null input", () => {
    expect(extractErrorData(null)).toBeNull();
  });

  it("should return null for undefined input", () => {
    expect(extractErrorData(undefined)).toBeNull();
  });

  it("should return null for non-object input", () => {
    expect(extractErrorData("string")).toBeNull();
  });

  it("should extract data from direct data property", () => {
    const error = { data: "0x08c379a0..." };
    expect(extractErrorData(error)).toBe("0x08c379a0...");
  });

  it("should extract data from nested error.data", () => {
    const error = { error: { data: "0x08c379a0..." } };
    expect(extractErrorData(error)).toBe("0x08c379a0...");
  });

  it("should extract data from info.error.data (ethers v6 format)", () => {
    const error = { info: { error: { data: "0x08c379a0..." } } };
    expect(extractErrorData(error)).toBe("0x08c379a0...");
  });

  it("should return null if no data found", () => {
    const error = { message: "some error" };
    expect(extractErrorData(error)).toBeNull();
  });
});

describe("getErrorSummary", () => {
  it("should return formatted summary", () => {
    const error = {
      type: "revert" as const,
      message: "Insufficient Balance",
      userMessage: "You don't have enough tokens.",
      suggestion: "Try a smaller amount.",
      raw: "0x...",
    };

    const summary = getErrorSummary(error);

    expect(summary).toBe("Insufficient Balance: You don't have enough tokens.");
  });
});

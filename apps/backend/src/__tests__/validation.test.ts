import {
  validateSimulationRequest,
  ValidationError,
} from "../utils/validation";

describe("validateSimulationRequest", () => {
  const validRequest = {
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab2d",
    to: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    value: "1000000000000000000",
    data: "0x",
  };

  describe("valid requests", () => {
    it("should validate a minimal valid request", () => {
      const result = validateSimulationRequest({
        from: validRequest.from,
        to: validRequest.to,
      });

      expect(result.from).toBe(validRequest.from);
      expect(result.to).toBe(validRequest.to);
      expect(result.value).toBe("0x0");
      expect(result.data).toBe("0x");
    });

    it("should validate a full valid request", () => {
      const result = validateSimulationRequest(validRequest);

      expect(result.from).toBe(validRequest.from);
      expect(result.to).toBe(validRequest.to);
      expect(result.value).toBe("0xde0b6b3a7640000"); // 1 ETH in hex
      expect(result.data).toBe("0x");
    });

    it("should handle hex value correctly", () => {
      const result = validateSimulationRequest({
        ...validRequest,
        value: "0xde0b6b3a7640000",
      });

      expect(result.value).toBe("0xde0b6b3a7640000");
    });

    it("should handle contract calldata", () => {
      const calldata =
        "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0ab2d0000000000000000000000000000000000000000000000000de0b6b3a7640000";
      const result = validateSimulationRequest({
        ...validRequest,
        data: calldata,
      });

      expect(result.data).toBe(calldata);
    });

    it("should handle gasLimit as string", () => {
      const result = validateSimulationRequest({
        ...validRequest,
        gasLimit: "100000",
      });

      expect(result.gasLimit).toBe("100000");
    });

    it("should handle blockTag 'latest'", () => {
      const result = validateSimulationRequest({
        ...validRequest,
        blockTag: "latest",
      });

      expect(result.blockTag).toBe("latest");
    });

    it("should handle blockTag 'pending'", () => {
      const result = validateSimulationRequest({
        ...validRequest,
        blockTag: "pending",
      });

      expect(result.blockTag).toBe("pending");
    });

    it("should handle blockTag as number", () => {
      const result = validateSimulationRequest({
        ...validRequest,
        blockTag: 12345678,
      });

      expect(result.blockTag).toBe(12345678);
    });
  });

  describe("invalid requests", () => {
    it("should throw for null input", () => {
      expect(() => validateSimulationRequest(null)).toThrow(ValidationError);
    });

    it("should throw for non-object input", () => {
      expect(() => validateSimulationRequest("invalid")).toThrow(
        ValidationError
      );
    });

    it("should throw for missing from address", () => {
      expect(() =>
        validateSimulationRequest({ to: validRequest.to })
      ).toThrow(ValidationError);
    });

    it("should throw for invalid from address format", () => {
      expect(() =>
        validateSimulationRequest({
          from: "invalid",
          to: validRequest.to,
        })
      ).toThrow(ValidationError);
    });

    it("should throw for from address with wrong length", () => {
      expect(() =>
        validateSimulationRequest({
          from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab", // 39 chars
          to: validRequest.to,
        })
      ).toThrow(ValidationError);
    });

    it("should throw for missing to address", () => {
      expect(() =>
        validateSimulationRequest({ from: validRequest.from })
      ).toThrow(ValidationError);
    });

    it("should throw for invalid to address", () => {
      expect(() =>
        validateSimulationRequest({
          from: validRequest.from,
          to: "not-an-address",
        })
      ).toThrow(ValidationError);
    });

    it("should throw for invalid value format", () => {
      expect(() =>
        validateSimulationRequest({
          ...validRequest,
          value: "not-a-number",
        })
      ).toThrow(ValidationError);
    });

    it("should throw for invalid data format", () => {
      expect(() =>
        validateSimulationRequest({
          ...validRequest,
          data: "not-hex-data",
        })
      ).toThrow(ValidationError);
    });

    it("should throw for invalid gasLimit format", () => {
      expect(() =>
        validateSimulationRequest({
          ...validRequest,
          gasLimit: "invalid",
        })
      ).toThrow(ValidationError);
    });

    it("should throw for invalid blockTag", () => {
      expect(() =>
        validateSimulationRequest({
          ...validRequest,
          blockTag: "invalid",
        })
      ).toThrow(ValidationError);
    });
  });
});

describe("ValidationError", () => {
  it("should create error with field and reason", () => {
    const error = new ValidationError("from", "is required");

    expect(error.field).toBe("from");
    expect(error.reason).toBe("is required");
    expect(error.message).toBe("Invalid from: is required");
    expect(error.name).toBe("ValidationError");
  });
});

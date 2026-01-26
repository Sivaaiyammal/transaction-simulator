import { ValidatedSimulationRequest } from "../types/simulation";

/**
 * Custom error class for validation failures
 */
export class ValidationError extends Error {
  public readonly field: string;
  public readonly reason: string;

  constructor(field: string, reason: string) {
    super(`Invalid ${field}: ${reason}`);
    this.name = "ValidationError";
    this.field = field;
    this.reason = reason;
  }
}

/**
 * Check if a string is a valid Ethereum address
 */
function isValidAddress(address: string): address is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/i.test(address);
}

/**
 * Check if a string is valid hex data
 */
function isValidHex(hex: string): boolean {
  return /^0x([a-fA-F0-9]{2})*$/i.test(hex);
}

/**
 * Check if a string is a valid numeric value (decimal or hex)
 */
function isValidNumericString(value: string): boolean {
  // Hex format
  if (value.startsWith("0x")) {
    return /^0x[a-fA-F0-9]+$/i.test(value);
  }
  // Decimal format
  return /^\d+$/.test(value);
}

/**
 * Normalize value to hex string
 */
function normalizeValue(value: string | undefined): string {
  if (!value || value === "0" || value === "0x0" || value === "0x") {
    return "0x0";
  }

  // Already hex
  if (value.startsWith("0x")) {
    return value;
  }

  // Convert decimal to hex
  try {
    const bigIntValue = BigInt(value);
    return "0x" + bigIntValue.toString(16);
  } catch {
    throw new ValidationError("value", "must be a valid number");
  }
}

/**
 * Validate and transform a simulation request
 */
export function validateSimulationRequest(
  input: unknown
): ValidatedSimulationRequest {
  // Check if input is an object
  if (!input || typeof input !== "object") {
    throw new ValidationError("request", "must be an object");
  }

  const req = input as Record<string, unknown>;

  // Validate 'from' address
  if (!req.from || typeof req.from !== "string") {
    throw new ValidationError("from", "is required and must be a string");
  }
  if (!isValidAddress(req.from)) {
    throw new ValidationError(
      "from",
      "must be a valid Ethereum address (0x + 40 hex characters)"
    );
  }

  // Validate 'to' address
  if (!req.to || typeof req.to !== "string") {
    throw new ValidationError("to", "is required and must be a string");
  }
  if (!isValidAddress(req.to)) {
    throw new ValidationError(
      "to",
      "must be a valid Ethereum address (0x + 40 hex characters)"
    );
  }

  // Validate 'value' if provided
  if (req.value !== undefined && req.value !== null) {
    if (typeof req.value !== "string") {
      throw new ValidationError("value", "must be a string");
    }
    if (!isValidNumericString(req.value)) {
      throw new ValidationError(
        "value",
        "must be a valid number (decimal or hex)"
      );
    }
  }

  // Validate 'data' if provided
  if (req.data !== undefined && req.data !== null) {
    if (typeof req.data !== "string") {
      throw new ValidationError("data", "must be a string");
    }
    if (req.data !== "0x" && !isValidHex(req.data)) {
      throw new ValidationError("data", "must be valid hex data (0x...)");
    }
  }

  // Validate 'gasLimit' if provided
  if (req.gasLimit !== undefined && req.gasLimit !== null) {
    if (typeof req.gasLimit !== "string") {
      throw new ValidationError("gasLimit", "must be a string");
    }
    if (!isValidNumericString(req.gasLimit)) {
      throw new ValidationError(
        "gasLimit",
        "must be a valid number (decimal or hex)"
      );
    }
  }

  // Validate 'blockTag' if provided
  let blockTag: "latest" | "pending" | number = "latest";
  if (req.blockTag !== undefined && req.blockTag !== null) {
    if (req.blockTag === "latest" || req.blockTag === "pending") {
      blockTag = req.blockTag;
    } else if (typeof req.blockTag === "number" && Number.isInteger(req.blockTag)) {
      blockTag = req.blockTag;
    } else {
      throw new ValidationError(
        "blockTag",
        'must be "latest", "pending", or a block number'
      );
    }
  }

  // Return validated and normalized request
  return {
    from: req.from as `0x${string}`,
    to: req.to as `0x${string}`,
    value: normalizeValue(req.value as string | undefined),
    data: (req.data as string) || "0x",
    gasLimit: req.gasLimit as string | undefined,
    blockTag,
  };
}

// ============================================
// Request Types
// ============================================

export interface SimulationRequest {
  from: string;
  to: string;
  value?: string; // in wei (string to avoid JS number limits)
  data?: string; // calldata (hex)
  gasLimit?: string;
  blockTag?: "latest" | "pending" | number;
}

export interface ValidatedSimulationRequest {
  from: `0x${string}`;
  to: `0x${string}`;
  value: string;
  data: string;
  gasLimit?: string;
  blockTag: "latest" | "pending" | number;
}

// ============================================
// Response Types (Discriminated Union)
// ============================================

export type SimulationResult = SimulationSuccess | SimulationFailure;

export interface SimulationSuccess {
  success: true;
  gasEstimate: string;
  returnData: string;
  decodedReturn?: DecodedData;
  ethTransfer: EthTransfer | null;
  tokenTransfers: TokenTransfer[];
  approvalChanges: ApprovalChange[];
}

export interface SimulationFailure {
  success: false;
  error: DecodedError;
  gasEstimate: string | null;
}

// ============================================
// Token & Transfer Types
// ============================================

export interface TokenTransfer {
  token: string; // Contract address
  symbol: string | null; // Token symbol if resolvable
  decimals: number; // Token decimals
  from: string;
  to: string;
  amount: string; // Raw amount in smallest unit
  formattedAmount: string; // Human-readable amount
}

export interface ApprovalChange {
  token: string;
  symbol: string | null;
  owner: string;
  spender: string;
  currentAllowance: string;
  newAllowance: string;
  isUnlimited: boolean; // true if max uint256
}

export interface EthTransfer {
  from: string;
  to: string;
  value: string; // in wei
  formattedValue: string; // in ETH
}

// ============================================
// Error Types
// ============================================

export type ErrorType = "revert" | "panic" | "custom" | "unknown";

export interface DecodedError {
  type: ErrorType;
  message: string; // Short error title
  userMessage: string; // User-friendly explanation
  suggestion: string; // Actionable suggestion for the user
  selector?: string; // First 4 bytes for custom errors
  panicCode?: number; // For Panic(uint256)
  raw: string; // Original error data
}

// ============================================
// Decoded Data Types
// ============================================

export interface DecodedData {
  types: string[];
  values: unknown[];
  raw: string;
}

// ============================================
// Token Metadata
// ============================================

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

// ============================================
// API Response Wrapper
// ============================================

export interface ApiResponse<T> {
  result?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

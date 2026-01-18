// ============================================
// Request Types
// ============================================

export interface SimulationRequest {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  blockTag?: "latest" | "pending" | number;
}

// ============================================
// Response Types
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
  token: string;
  symbol: string | null;
  decimals: number;
  from: string;
  to: string;
  amount: string;
  formattedAmount: string;
}

export interface ApprovalChange {
  token: string;
  symbol: string | null;
  owner: string;
  spender: string;
  currentAllowance: string;
  newAllowance: string;
  isUnlimited: boolean;
}

export interface EthTransfer {
  from: string;
  to: string;
  value: string;
  formattedValue: string;
}

// ============================================
// Error Types
// ============================================

export interface DecodedError {
  type: "revert" | "panic" | "custom" | "unknown";
  message: string;
  userMessage: string;
  suggestion: string;
  selector?: string;
  panicCode?: number;
  raw: string;
}

export interface DecodedData {
  types: string[];
  values: unknown[];
  raw: string;
}

// ============================================
// API Response
// ============================================

export interface ApiResponse<T> {
  result?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

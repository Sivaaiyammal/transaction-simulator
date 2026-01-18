import { formatEther } from "ethers";
import { getEthereumProvider } from "../utils/rpc";
import {
  ValidatedSimulationRequest,
  SimulationResult,
  EthTransfer,
  DecodedError,
} from "../types/simulation";
import { decodeError, extractErrorData } from "./errorDecoder";
import { TokenAnalyzer } from "./tokenAnalyzer";

/**
 * Simulate a transaction and return comprehensive analysis
 */
export async function simulateTx(
  input: ValidatedSimulationRequest
): Promise<SimulationResult> {
  const provider = getEthereumProvider();
  const tokenAnalyzer = new TokenAnalyzer(provider);

  const tx = {
    from: input.from,
    to: input.to,
    value: input.value,
    data: input.data,
    gasLimit: input.gasLimit,
  };

  try {
    // Execute simulation and token analysis in parallel
    const [callResult, gasEstimate, tokenAnalysis] = await Promise.all([
      provider.call({
        ...tx,
        blockTag: input.blockTag ?? "latest",
      }),
      provider
        .estimateGas(tx)
        .then((gas) => gas.toString())
        .catch(() => "unknown"),
      tokenAnalyzer.analyzeTransaction(
        input.from,
        input.to,
        input.data,
        input.value
      ),
    ]);

    const ethTransfer = buildEthTransfer(input.from, input.to, input.value);

    return {
      success: true,
      gasEstimate,
      returnData: callResult,
      ethTransfer,
      tokenTransfers: tokenAnalysis.transfers,
      approvalChanges: tokenAnalysis.approvals,
    };
  } catch (error: unknown) {
    // Extract and decode the error
    const errorData = extractErrorData(error);
    let decodedError = decodeError(errorData);

    // Try to get gas estimate even on failure
    let gasEstimate: string | null = null;
    try {
      const estimate = await provider.estimateGas(tx);
      gasEstimate = estimate.toString();
    } catch {
      // Gas estimation failed
    }

    // If we couldn't decode the error data, try to parse the error message
    if (decodedError.type === "unknown" && error instanceof Error) {
      decodedError = parseEthersError(error, decodedError);
    }

    return {
      success: false,
      error: decodedError,
      gasEstimate,
    };
  }
}

/**
 * Parse ethers.js error messages and return user-friendly error
 */
function parseEthersError(error: Error, fallback: DecodedError): DecodedError {
  const message = error.message || "";

  // Check for "reverted with reason string" pattern
  const revertMatch = message.match(/reverted with reason string ['"](.*?)['"]/);
  if (revertMatch) {
    const reason = revertMatch[1];
    return createUserFriendlyError("revert", reason);
  }

  // Check for "execution reverted" pattern
  if (message.includes("execution reverted")) {
    // Try to extract any reason
    const reasonMatch = message.match(/execution reverted(?::\s*(.+?))?(?:\s*\(|$)/i);
    const reason = reasonMatch?.[1]?.trim();

    if (reason) {
      return createUserFriendlyError("revert", reason);
    }

    return {
      type: "revert",
      message: "Transaction Reverted",
      userMessage: "The smart contract rejected this transaction.",
      suggestion: "The contract didn't provide a specific reason. Check your input parameters.",
      raw: fallback.raw,
    };
  }

  // Check for insufficient funds
  if (message.includes("insufficient funds") || message.includes("insufficient balance")) {
    return {
      type: "revert",
      message: "Insufficient Funds",
      userMessage: "You don't have enough ETH to cover the transaction value and gas fees.",
      suggestion: "Add more ETH to your wallet or reduce the transaction amount.",
      raw: fallback.raw,
    };
  }

  // Check for gas-related errors
  if (message.includes("gas required exceeds") || message.includes("out of gas")) {
    return {
      type: "revert",
      message: "Gas Limit Exceeded",
      userMessage: "The transaction requires more gas than allowed.",
      suggestion: "Increase the gas limit or simplify the transaction.",
      raw: fallback.raw,
    };
  }

  // Check for nonce errors
  if (message.includes("nonce")) {
    return {
      type: "revert",
      message: "Nonce Error",
      userMessage: "There's a transaction sequencing issue with your account.",
      suggestion: "Wait for pending transactions to complete or reset your wallet nonce.",
      raw: fallback.raw,
    };
  }

  // Check for "missing revert data" - common when contract reverts without reason
  if (message.includes("missing revert data")) {
    return {
      type: "revert",
      message: "Transaction Would Fail",
      userMessage: "The contract rejected this transaction but didn't specify why.",
      suggestion: "Common causes: insufficient token balance, missing approval, or invalid parameters.",
      raw: fallback.raw,
    };
  }

  // Check for network/connection errors
  if (message.includes("network") || message.includes("connect") || message.includes("timeout")) {
    return {
      type: "unknown",
      message: "Network Error",
      userMessage: "Could not connect to the Ethereum network.",
      suggestion: "Check your internet connection and try again.",
      raw: fallback.raw,
    };
  }

  // Default: return a clean version
  return {
    type: "unknown",
    message: "Transaction Failed",
    userMessage: "The transaction could not be completed.",
    suggestion: "Please verify all parameters are correct and try again.",
    raw: fallback.raw,
  };
}

/**
 * Create user-friendly error from a revert reason string
 */
function createUserFriendlyError(type: "revert" | "panic" | "custom" | "unknown", reason: string): DecodedError {
  const reasonLower = reason.toLowerCase();

  // Map common revert reasons to user-friendly messages
  const errorMappings: Array<{
    keywords: string[];
    message: string;
    userMessage: string;
    suggestion: string;
  }> = [
    {
      keywords: ["insufficient balance", "transfer amount exceeds balance", "exceeds balance"],
      message: "Insufficient Balance",
      userMessage: "You don't have enough tokens to complete this transfer.",
      suggestion: "Check your token balance and try a smaller amount.",
    },
    {
      keywords: ["insufficient allowance", "allowance"],
      message: "Approval Required",
      userMessage: "You haven't approved the contract to spend your tokens.",
      suggestion: "First approve the contract to spend your tokens, then try again.",
    },
    {
      keywords: ["not owner", "caller is not the owner", "unauthorized"],
      message: "Not Authorized",
      userMessage: "You don't have permission to perform this action.",
      suggestion: "Only the contract owner or authorized addresses can do this.",
    },
    {
      keywords: ["paused", "pausable"],
      message: "Contract Paused",
      userMessage: "This contract is temporarily paused.",
      suggestion: "Wait for the contract to be unpaused before trying again.",
    },
    {
      keywords: ["zero address", "invalid address"],
      message: "Invalid Address",
      userMessage: "One of the addresses provided is invalid.",
      suggestion: "Double-check the recipient address.",
    },
    {
      keywords: ["expired", "deadline"],
      message: "Transaction Expired",
      userMessage: "The transaction deadline has passed.",
      suggestion: "Try again with a new transaction.",
    },
    {
      keywords: ["slippage", "output amount"],
      message: "Slippage Too High",
      userMessage: "The price changed more than your allowed tolerance.",
      suggestion: "Increase slippage tolerance or try a smaller trade.",
    },
    {
      keywords: ["liquidity"],
      message: "Insufficient Liquidity",
      userMessage: "Not enough liquidity in the pool for this trade.",
      suggestion: "Try a smaller amount or different trading pair.",
    },
  ];

  // Find matching error
  for (const mapping of errorMappings) {
    if (mapping.keywords.some(kw => reasonLower.includes(kw))) {
      return {
        type,
        message: mapping.message,
        userMessage: mapping.userMessage,
        suggestion: mapping.suggestion,
        raw: reason,
      };
    }
  }

  // No match - return the original reason with generic help
  return {
    type,
    message: reason.length > 50 ? reason.substring(0, 50) + "..." : reason,
    userMessage: reason,
    suggestion: "Review the error message and check your transaction parameters.",
    raw: reason,
  };
}

/**
 * Build ETH transfer info if value > 0
 */
function buildEthTransfer(
  from: string,
  to: string,
  value: string
): EthTransfer | null {
  if (!value || value === "0x0" || value === "0x" || value === "0") {
    return null;
  }

  try {
    const valueBigInt = BigInt(value);
    if (valueBigInt === 0n) {
      return null;
    }

    return {
      from,
      to,
      value: valueBigInt.toString(),
      formattedValue: formatEther(valueBigInt),
    };
  } catch {
    return null;
  }
}

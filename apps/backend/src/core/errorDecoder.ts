import { AbiCoder } from "ethers";
import { DecodedError } from "../types/simulation";

/**
 * Solidity Panic codes with user-friendly explanations
 */
const PANIC_CODES: Record<number, { title: string; explanation: string; suggestion: string }> = {
  0x00: {
    title: "Generic compiler panic",
    explanation: "An unexpected error occurred in the smart contract.",
    suggestion: "This is likely a bug in the contract. Contact the project team.",
  },
  0x01: {
    title: "Assertion failed",
    explanation: "A condition the contract expected to be true was false.",
    suggestion: "The contract's internal state doesn't match expected conditions.",
  },
  0x11: {
    title: "Arithmetic overflow or underflow",
    explanation: "A math operation resulted in a number too large or below zero.",
    suggestion: "Try a smaller amount or check if the values are correct.",
  },
  0x12: {
    title: "Division by zero",
    explanation: "The contract tried to divide by zero.",
    suggestion: "Check input values - one of them might be zero when it shouldn't be.",
  },
  0x21: {
    title: "Invalid enum value",
    explanation: "An invalid option was selected in the contract.",
    suggestion: "The input parameters may be incorrect.",
  },
  0x22: {
    title: "Storage encoding error",
    explanation: "The contract's storage data is corrupted.",
    suggestion: "This is a serious contract bug. Do not interact with this contract.",
  },
  0x31: {
    title: "Empty array error",
    explanation: "The contract tried to remove an item from an empty list.",
    suggestion: "There may be nothing left to withdraw or remove.",
  },
  0x32: {
    title: "Array index out of bounds",
    explanation: "The contract tried to access an item that doesn't exist.",
    suggestion: "Check if the index or ID you're using is valid.",
  },
  0x41: {
    title: "Out of memory",
    explanation: "The transaction requires too much memory to execute.",
    suggestion: "Try processing smaller batches of data.",
  },
  0x51: {
    title: "Internal function error",
    explanation: "The contract tried to call an uninitialized function.",
    suggestion: "This is a contract bug. Contact the project team.",
  },
};

/**
 * Common error messages with user-friendly explanations
 */
const COMMON_ERROR_MESSAGES: Record<string, { title: string; explanation: string; suggestion: string }> = {
  // ERC20 errors
  "insufficient balance": {
    title: "Insufficient Balance",
    explanation: "You don't have enough tokens to complete this transfer.",
    suggestion: "Check your token balance and try a smaller amount.",
  },
  "transfer amount exceeds balance": {
    title: "Insufficient Balance",
    explanation: "The transfer amount is more than your available balance.",
    suggestion: "Reduce the amount or add more tokens to your wallet.",
  },
  "insufficient allowance": {
    title: "Approval Required",
    explanation: "You haven't approved the contract to spend your tokens.",
    suggestion: "First approve the contract to spend your tokens, then try again.",
  },
  "approve from the zero address": {
    title: "Invalid Approval",
    explanation: "Cannot approve from an empty address.",
    suggestion: "Make sure your wallet is connected properly.",
  },
  "transfer to the zero address": {
    title: "Invalid Recipient",
    explanation: "Cannot send tokens to the zero address (0x000...000).",
    suggestion: "Double-check the recipient address.",
  },

  // Ownership errors
  "ownable: caller is not the owner": {
    title: "Not Authorized",
    explanation: "Only the contract owner can perform this action.",
    suggestion: "This function is restricted to the contract administrator.",
  },
  "caller is not the owner": {
    title: "Not Authorized",
    explanation: "You don't have permission to call this function.",
    suggestion: "Only the contract owner can perform this action.",
  },

  // Pausable errors
  "pausable: paused": {
    title: "Contract Paused",
    explanation: "This contract is temporarily paused and not accepting transactions.",
    suggestion: "Wait for the contract to be unpaused, or check project announcements.",
  },
  "contract is paused": {
    title: "Contract Paused",
    explanation: "The contract has been paused by the administrator.",
    suggestion: "Try again later when the contract is active.",
  },

  // Reentrancy
  "reentrant call": {
    title: "Reentrancy Blocked",
    explanation: "The contract blocked a potentially dangerous recursive call.",
    suggestion: "This is a security feature. Your transaction structure may be incorrect.",
  },
  "reentrancyguard: reentrant call": {
    title: "Reentrancy Blocked",
    explanation: "Multiple calls to the contract in one transaction are not allowed.",
    suggestion: "Try calling the function directly without batching.",
  },

  // DEX / Swap errors
  "insufficient liquidity": {
    title: "Not Enough Liquidity",
    explanation: "The trading pool doesn't have enough tokens for this swap.",
    suggestion: "Try a smaller amount or use a different trading pair.",
  },
  "insufficient output amount": {
    title: "Slippage Too High",
    explanation: "The price moved and you would receive less than your minimum.",
    suggestion: "Increase slippage tolerance or try a smaller trade.",
  },
  "insufficient input amount": {
    title: "Invalid Input",
    explanation: "The input amount is too small for this trade.",
    suggestion: "Increase the input amount.",
  },
  "expired": {
    title: "Transaction Expired",
    explanation: "The transaction deadline has passed.",
    suggestion: "Try again with a new transaction.",
  },
  "deadline": {
    title: "Deadline Passed",
    explanation: "The transaction took too long and expired.",
    suggestion: "Increase the deadline or try again immediately.",
  },
  "slippage": {
    title: "Price Slippage",
    explanation: "The price changed more than your allowed tolerance.",
    suggestion: "Increase slippage tolerance in your settings.",
  },

  // NFT errors
  "erc721: invalid token id": {
    title: "NFT Not Found",
    explanation: "This NFT token ID doesn't exist.",
    suggestion: "Verify the token ID is correct.",
  },
  "erc721: caller is not token owner or approved": {
    title: "Not NFT Owner",
    explanation: "You don't own this NFT or have approval to transfer it.",
    suggestion: "Check that you own this NFT in your wallet.",
  },

  // General errors
  "execution reverted": {
    title: "Transaction Reverted",
    explanation: "The smart contract rejected this transaction.",
    suggestion: "Check the transaction parameters and try again.",
  },
  "out of gas": {
    title: "Out of Gas",
    explanation: "The transaction ran out of gas before completing.",
    suggestion: "Increase the gas limit for this transaction.",
  },
  "gas required exceeds allowance": {
    title: "Gas Limit Too Low",
    explanation: "The transaction needs more gas than provided.",
    suggestion: "Increase the gas limit.",
  },
};

/**
 * Custom error selectors with user-friendly messages
 */
const KNOWN_CUSTOM_ERRORS: Record<string, { signature: string; title: string; explanation: string; suggestion: string }> = {
  // ERC20 errors (EIP-6093)
  "0xe450d38c": {
    signature: "ERC20InsufficientBalance(address,uint256,uint256)",
    title: "Insufficient Token Balance",
    explanation: "Your token balance is less than the amount you're trying to send.",
    suggestion: "Check your balance and reduce the transfer amount.",
  },
  "0xfb8f41b2": {
    signature: "ERC20InsufficientAllowance(address,address,uint256,uint256)",
    title: "Approval Required",
    explanation: "The contract doesn't have permission to spend your tokens.",
    suggestion: "Approve the contract to spend tokens first.",
  },
  "0x96c6fd1e": {
    signature: "ERC20InvalidSender(address)",
    title: "Invalid Sender",
    explanation: "The sender address is not valid for this operation.",
    suggestion: "Check the 'from' address is correct.",
  },
  "0xec442f05": {
    signature: "ERC20InvalidReceiver(address)",
    title: "Invalid Recipient",
    explanation: "Cannot send tokens to this address.",
    suggestion: "Verify the recipient address is correct and can receive tokens.",
  },

  // Uniswap errors
  "0x5a59f53c": {
    signature: "InsufficientInputAmount()",
    title: "Input Too Low",
    explanation: "The input amount is too small for this swap.",
    suggestion: "Increase the amount you're swapping.",
  },
  "0x849eaf98": {
    signature: "InsufficientOutputAmount()",
    title: "Slippage Exceeded",
    explanation: "You would receive less than your minimum due to price movement.",
    suggestion: "Increase slippage tolerance or reduce trade size.",
  },
  "0xced3e100": {
    signature: "InsufficientLiquidity()",
    title: "Low Liquidity",
    explanation: "Not enough liquidity in the pool for this trade.",
    suggestion: "Try a smaller amount or different trading pair.",
  },

  // OpenZeppelin Access Control
  "0x118cdaa7": {
    signature: "OwnableUnauthorizedAccount(address)",
    title: "Not Authorized",
    explanation: "Your wallet is not authorized to perform this action.",
    suggestion: "This function is restricted to specific addresses.",
  },
  "0x1e4fbdf7": {
    signature: "OwnableInvalidOwner(address)",
    title: "Invalid Owner",
    explanation: "The provided owner address is invalid.",
    suggestion: "Check the owner address parameter.",
  },
  "0xe07c8dba": {
    signature: "EnforcedPause()",
    title: "Contract Paused",
    explanation: "This contract is currently paused.",
    suggestion: "Wait for the contract to be unpaused.",
  },
  "0xd93c0665": {
    signature: "ExpectedPause()",
    title: "Contract Not Paused",
    explanation: "This action requires the contract to be paused.",
    suggestion: "The contract must be paused first.",
  },

  // Transfer errors
  "0xd92e233d": {
    signature: "ZeroAddress()",
    title: "Zero Address",
    explanation: "Cannot use the zero address (0x000...000) for this operation.",
    suggestion: "Provide a valid Ethereum address.",
  },
  "0x2e076300": {
    signature: "NotEnoughBalance()",
    title: "Insufficient Balance",
    explanation: "Not enough balance to complete this transaction.",
    suggestion: "Add more funds or reduce the amount.",
  },
};

const abiCoder = new AbiCoder();

/**
 * Decode error data and return user-friendly message
 */
export function decodeError(errorData: string | undefined | null): DecodedError {
  // Handle empty or missing error data
  if (!errorData || errorData === "0x" || errorData.length < 10) {
    return {
      type: "unknown",
      message: "Transaction failed",
      userMessage: "The transaction was rejected by the smart contract.",
      suggestion: "Double-check all transaction parameters and try again.",
      raw: errorData || "0x",
    };
  }

  const selector = errorData.slice(0, 10).toLowerCase();
  const data = "0x" + errorData.slice(10);

  // Try to decode Error(string) - selector: 0x08c379a0
  if (selector === "0x08c379a0") {
    return decodeRevertString(data, errorData);
  }

  // Try to decode Panic(uint256) - selector: 0x4e487b71
  if (selector === "0x4e487b71") {
    return decodePanic(data, errorData);
  }

  // Try to match known custom errors
  const knownError = KNOWN_CUSTOM_ERRORS[selector];
  if (knownError) {
    return {
      type: "custom",
      message: knownError.title,
      userMessage: knownError.explanation,
      suggestion: knownError.suggestion,
      selector,
      raw: errorData,
    };
  }

  // Unknown error with selector
  return {
    type: "custom",
    message: "Contract Error",
    userMessage: `The contract returned an error (${selector}).`,
    suggestion: "This may be a custom error from the contract. Check the contract documentation.",
    selector,
    raw: errorData,
  };
}

/**
 * Decode Error(string) revert reason and match to user-friendly message
 */
function decodeRevertString(data: string, raw: string): DecodedError {
  try {
    const [reason] = abiCoder.decode(["string"], data);
    const reasonLower = (reason || "").toLowerCase().trim();

    // Try to find a matching user-friendly message
    for (const [key, value] of Object.entries(COMMON_ERROR_MESSAGES)) {
      if (reasonLower.includes(key)) {
        return {
          type: "revert",
          message: value.title,
          userMessage: value.explanation,
          suggestion: value.suggestion,
          raw,
        };
      }
    }

    // No match found, return the raw message with generic help
    return {
      type: "revert",
      message: reason || "Transaction Reverted",
      userMessage: reason || "The contract rejected this transaction.",
      suggestion: "Review the error message above and check your transaction parameters.",
      raw,
    };
  } catch {
    return {
      type: "revert",
      message: "Transaction Reverted",
      userMessage: "The contract rejected this transaction but didn't provide a clear reason.",
      suggestion: "Try with different parameters or contact the project team.",
      raw,
    };
  }
}

/**
 * Decode Panic(uint256) error with user-friendly message
 */
function decodePanic(data: string, raw: string): DecodedError {
  try {
    const [panicCode] = abiCoder.decode(["uint256"], data);
    const code = Number(panicCode);
    const panicInfo = PANIC_CODES[code];

    if (panicInfo) {
      return {
        type: "panic",
        message: panicInfo.title,
        userMessage: panicInfo.explanation,
        suggestion: panicInfo.suggestion,
        panicCode: code,
        raw,
      };
    }

    return {
      type: "panic",
      message: `Panic Error (0x${code.toString(16)})`,
      userMessage: "The smart contract encountered an unexpected error.",
      suggestion: "This may be a bug in the contract. Contact the project team.",
      panicCode: code,
      raw,
    };
  } catch {
    return {
      type: "panic",
      message: "Panic Error",
      userMessage: "The contract encountered a critical error.",
      suggestion: "Do not retry. This may indicate a serious issue with the contract.",
      raw,
    };
  }
}

/**
 * Extract error data from various error formats
 */
export function extractErrorData(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const err = error as Record<string, unknown>;

  // ethers.js v6 format
  if (err.data && typeof err.data === "string") {
    return err.data;
  }

  // Nested error format
  if (err.error && typeof err.error === "object") {
    const nestedErr = err.error as Record<string, unknown>;
    if (nestedErr.data && typeof nestedErr.data === "string") {
      return nestedErr.data;
    }
  }

  // Provider error format
  if (err.info && typeof err.info === "object") {
    const info = err.info as Record<string, unknown>;
    if (info.error && typeof info.error === "object") {
      const infoErr = info.error as Record<string, unknown>;
      if (infoErr.data && typeof infoErr.data === "string") {
        return infoErr.data;
      }
    }
  }

  return null;
}

/**
 * Get a simple one-line summary for quick display
 */
export function getErrorSummary(error: DecodedError): string {
  return `${error.message}: ${error.userMessage}`;
}

import { JsonRpcProvider, Interface, Contract, formatUnits } from "ethers";
import { TokenTransfer, ApprovalChange, TokenInfo } from "../types/simulation";

/**
 * ERC20 ABI - minimal interface for token analysis
 */
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

/**
 * ERC20 function selectors
 */
const ERC20_SELECTORS = {
  // transfer(address,uint256)
  TRANSFER: "0xa9059cbb",
  // transferFrom(address,address,uint256)
  TRANSFER_FROM: "0x23b872dd",
  // approve(address,uint256)
  APPROVE: "0x095ea7b3",
};

/**
 * Maximum uint256 value (used to detect "unlimited" approvals)
 */
const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);

const erc20Interface = new Interface(ERC20_ABI);

/**
 * In-memory cache for token metadata
 */
const tokenCache = new Map<string, TokenInfo>();

/**
 * Token Analyzer - analyzes transactions for ERC20 transfers and approvals
 */
export class TokenAnalyzer {
  constructor(private provider: JsonRpcProvider) {}

  /**
   * Analyze a transaction for token transfers and approval changes
   */
  async analyzeTransaction(
    from: string,
    to: string,
    data: string,
    _value: string
  ): Promise<{
    transfers: TokenTransfer[];
    approvals: ApprovalChange[];
  }> {
    const transfers: TokenTransfer[] = [];
    const approvals: ApprovalChange[] = [];

    // Skip if no data (simple ETH transfer)
    if (!data || data === "0x" || data.length < 10) {
      return { transfers, approvals };
    }

    const selector = data.slice(0, 10).toLowerCase();

    try {
      // Handle transfer(address,uint256)
      if (selector === ERC20_SELECTORS.TRANSFER) {
        const decoded = erc20Interface.decodeFunctionData("transfer", data);
        const recipient = decoded[0] as string;
        const amount = decoded[1] as bigint;

        const tokenInfo = await this.getTokenInfo(to);
        if (tokenInfo) {
          transfers.push({
            token: to,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            from: from,
            to: recipient,
            amount: amount.toString(),
            formattedAmount: formatUnits(amount, tokenInfo.decimals),
          });
        }
      }

      // Handle transferFrom(address,address,uint256)
      if (selector === ERC20_SELECTORS.TRANSFER_FROM) {
        const decoded = erc20Interface.decodeFunctionData("transferFrom", data);
        const sender = decoded[0] as string;
        const recipient = decoded[1] as string;
        const amount = decoded[2] as bigint;

        const tokenInfo = await this.getTokenInfo(to);
        if (tokenInfo) {
          transfers.push({
            token: to,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimals,
            from: sender,
            to: recipient,
            amount: amount.toString(),
            formattedAmount: formatUnits(amount, tokenInfo.decimals),
          });
        }
      }

      // Handle approve(address,uint256)
      if (selector === ERC20_SELECTORS.APPROVE) {
        const decoded = erc20Interface.decodeFunctionData("approve", data);
        const spender = decoded[0] as string;
        const amount = decoded[1] as bigint;

        const tokenInfo = await this.getTokenInfo(to);
        if (tokenInfo) {
          // Get current allowance
          const currentAllowance = await this.getAllowance(to, from, spender);

          approvals.push({
            token: to,
            symbol: tokenInfo.symbol,
            owner: from,
            spender: spender,
            currentAllowance: currentAllowance,
            newAllowance: amount.toString(),
            isUnlimited: amount === MAX_UINT256,
          });
        }
      }
    } catch {
      // Silently fail - the target contract may not be ERC20
      // This is expected for non-token contracts
    }

    return { transfers, approvals };
  }

  /**
   * Get token metadata (symbol, decimals, name)
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo | null> {
    const cacheKey = tokenAddress.toLowerCase();

    // Check cache first
    if (tokenCache.has(cacheKey)) {
      return tokenCache.get(cacheKey)!;
    }

    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);

      // Fetch token metadata in parallel
      const [symbol, decimals, name] = await Promise.all([
        contract.symbol().catch(() => null),
        contract.decimals().catch(() => 18),
        contract.name().catch(() => null),
      ]);

      // If we couldn't get a symbol, this probably isn't an ERC20 token
      if (!symbol) {
        return null;
      }

      const tokenInfo: TokenInfo = {
        address: tokenAddress,
        symbol,
        decimals: Number(decimals),
        name: name || undefined,
      };

      // Cache the result
      tokenCache.set(cacheKey, tokenInfo);

      return tokenInfo;
    } catch {
      return null;
    }
  }

  /**
   * Get current allowance for a token
   */
  async getAllowance(
    tokenAddress: string,
    owner: string,
    spender: string
  ): Promise<string> {
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
      const allowance = await contract.allowance(owner, spender);
      return allowance.toString();
    } catch {
      return "0";
    }
  }

  /**
   * Get token balance for an address
   */
  async getBalance(tokenAddress: string, account: string): Promise<string> {
    try {
      const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(account);
      return balance.toString();
    } catch {
      return "0";
    }
  }
}

/**
 * Clear the token metadata cache
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

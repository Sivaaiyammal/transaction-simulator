import { useState } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import type { SimulationResult as SimResult, SimulationRequest } from "../../types/simulation";
import { GasEstimate } from "./GasEstimate";
import { TokenTransferCard } from "./TokenTransferCard";
import { ApprovalCard } from "./ApprovalCard";
import { ErrorDisplay } from "./ErrorDisplay";

interface Props {
  result: SimResult;
  transactionRequest: SimulationRequest | null;
}

// Convert hex wei value to decimal ETH string
function hexToEth(hexValue: string | undefined): string {
  if (!hexValue || hexValue === "0x0" || hexValue === "0x") return "0";
  try {
    const wei = BigInt(hexValue);
    const eth = Number(wei) / 1e18;
    // Format with up to 6 decimal places, removing trailing zeros
    return eth.toFixed(6).replace(/\.?0+$/, "") || "0";
  } catch {
    return "0";
  }
}

export function SimulationResult({ result, transactionRequest }: Props) {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { sendTransaction, isPending: isSending, error: sendError } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleSendTransaction = () => {
    if (!transactionRequest) return;

    sendTransaction(
      {
        to: transactionRequest.to as `0x${string}`,
        value: transactionRequest.value ? BigInt(transactionRequest.value) : 0n,
        data: (transactionRequest.data || "0x") as `0x${string}`,
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
        },
      }
    );
  };

  if (!result.success) {
    return <ErrorDisplay error={result.error} gasEstimate={result.gasEstimate} />;
  }

  const ethValue = hexToEth(transactionRequest?.value);

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-emerald-800 font-bold text-lg">Transaction Would Succeed</h3>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                Simulation (eth_call)
              </span>
            </div>
            <p className="text-emerald-600 text-sm">
              This transaction can be safely executed on-chain
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      {transactionRequest && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-eth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Transaction Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Value</span>
              <span className="font-bold text-gray-900">{ethValue} ETH</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">To</span>
              <span className="font-mono text-sm text-gray-700">{formatAddress(transactionRequest.to)}</span>
            </div>
            {transactionRequest.data && transactionRequest.data !== "0x" && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Has Data</span>
                <span className="text-xs bg-eth-100 text-eth-700 px-2 py-1 rounded-full font-medium">Contract Call</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Transaction Button */}
      {transactionRequest && !isConfirmed && (
        <div className="bg-white rounded-2xl card-shadow p-5 border-2 border-eth-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-eth-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-eth-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Ready to Send</h3>
              <p className="text-xs text-gray-500">Execute this transaction on-chain</p>
            </div>
          </div>

          {sendError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {sendError.message.includes("User rejected")
                  ? "Transaction was rejected in wallet"
                  : "Failed to send transaction"}
              </p>
            </div>
          )}

          <button
            onClick={handleSendTransaction}
            disabled={isSending || isConfirming}
            className="w-full btn-gradient text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Confirm in Wallet...
              </>
            ) : isConfirming ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Waiting for Confirmation...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send Transaction
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Opens MetaMask to confirm the real transaction
          </p>

          {/* Testnet recommendation */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700 flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Tip:</strong> Use a testnet (Sepolia, Goerli) for demo purposes</span>
            </p>
          </div>
        </div>
      )}

      {/* Transaction Confirmed */}
      {isConfirmed && txHash && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-emerald-800 font-bold text-lg">Transaction Confirmed!</h3>
              <p className="text-emerald-600 text-sm">
                Your transaction has been successfully executed
              </p>
            </div>
          </div>

          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center bg-white border border-emerald-300 text-emerald-700 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on Etherscan
          </a>
        </div>
      )}

      {/* Pending Transaction */}
      {txHash && isConfirming && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-amber-800 font-bold">Transaction Pending</h3>
              <p className="text-amber-600 text-sm font-mono">
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gas Estimate */}
      <GasEstimate estimate={result.gasEstimate} />

      {/* ETH Transfer */}
      {result.ethTransfer && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            ETH Transfer
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {result.ethTransfer.formattedValue} ETH
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">{formatAddress(result.ethTransfer.from)}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="font-mono bg-slate-100 px-2 py-1 rounded">{formatAddress(result.ethTransfer.to)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Token Transfers */}
      {result.tokenTransfers.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            Token Transfers
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-auto">{result.tokenTransfers.length}</span>
          </h3>
          <div className="space-y-2">
            {result.tokenTransfers.map((transfer, i) => (
              <TokenTransferCard key={i} transfer={transfer} />
            ))}
          </div>
        </div>
      )}

      {/* Approval Changes */}
      {result.approvalChanges.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            Approval Changes
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-auto">{result.approvalChanges.length}</span>
          </h3>
          <div className="space-y-2">
            {result.approvalChanges.map((approval, i) => (
              <ApprovalCard key={i} approval={approval} />
            ))}
          </div>
        </div>
      )}

      {/* Return Data */}
      {result.returnData && result.returnData !== "0x" && (
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            Return Data
          </h3>
          <code className="block text-xs bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto font-mono">
            {result.returnData}
          </code>
        </div>
      )}
    </div>
  );
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

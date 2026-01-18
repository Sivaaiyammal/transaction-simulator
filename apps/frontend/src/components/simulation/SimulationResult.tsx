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

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-green-800 font-medium">Transaction Would Succeed</h3>
          <p className="text-green-600 text-sm">
            This transaction can be executed on-chain
          </p>
        </div>
      </div>

      {/* Send Transaction Button */}
      {transactionRequest && !isConfirmed && (
        <div className="bg-white border-2 border-eth-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Ready to Send</h3>

          {sendError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {sendError.message.includes("User rejected")
                  ? "Transaction was rejected in wallet"
                  : "Failed to send transaction"}
              </p>
            </div>
          )}

          <button
            onClick={handleSendTransaction}
            disabled={isSending || isConfirming}
            className="w-full bg-eth-600 hover:bg-eth-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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

          <p className="text-xs text-gray-500 mt-2 text-center">
            This will open MetaMask to confirm the real transaction
          </p>
        </div>
      )}

      {/* Transaction Confirmed */}
      {isConfirmed && txHash && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-green-800 font-medium">Transaction Confirmed!</h3>
              <p className="text-green-600 text-sm">
                Your transaction has been successfully executed
              </p>
            </div>
          </div>

          <a
            href={`https://etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-white border border-green-300 text-green-700 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {/* Pending Transaction */}
      {txHash && isConfirming && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="animate-spin w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-yellow-800 font-medium">Transaction Pending</h3>
              <p className="text-yellow-600 text-sm font-mono">
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
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4"
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
            ETH Transfer
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {result.ethTransfer.formattedValue} ETH
            </div>
            <div className="text-sm text-gray-500">
              <span className="font-mono">{formatAddress(result.ethTransfer.from)}</span>
              <span className="mx-2">→</span>
              <span className="font-mono">{formatAddress(result.ethTransfer.to)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Token Transfers */}
      {result.tokenTransfers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4"
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
            Token Transfers ({result.tokenTransfers.length})
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
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4"
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
            Approval Changes ({result.approvalChanges.length})
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
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Return Data</h3>
          <code className="block text-xs bg-gray-50 p-2 rounded overflow-x-auto font-mono text-gray-600">
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

import type { ApprovalChange } from "../../types/simulation";

interface Props {
  approval: ApprovalChange;
}

export function ApprovalCard({ approval }: Props) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      className={`rounded-lg p-3 ${
        approval.isUnlimited
          ? "bg-yellow-50 border border-yellow-200"
          : "bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-eth-100 rounded-full flex items-center justify-center">
            <span className="text-eth-600 font-bold text-xs">
              {approval.symbol?.slice(0, 1) || "?"}
            </span>
          </div>
          <span className="font-medium text-gray-900">
            {approval.symbol || "TOKEN"}
          </span>
        </div>

        {approval.isUnlimited && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
            Unlimited
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <span className="text-gray-500">Spender:</span>{" "}
        <span className="font-mono">{formatAddress(approval.spender)}</span>
      </div>

      {approval.isUnlimited && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 rounded p-2">
          This approval grants unlimited spending permission. Only approve
          trusted contracts.
        </div>
      )}
    </div>
  );
}

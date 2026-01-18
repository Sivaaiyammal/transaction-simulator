import type { TokenTransfer } from "../../types/simulation";

interface Props {
  transfer: TokenTransfer;
}

export function TokenTransferCard({ transfer }: Props) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Token Icon Placeholder */}
        <div className="w-8 h-8 bg-eth-100 rounded-full flex items-center justify-center">
          <span className="text-eth-600 font-bold text-xs">
            {transfer.symbol?.slice(0, 2) || "?"}
          </span>
        </div>

        <div>
          <div className="font-medium text-gray-900">
            {transfer.formattedAmount} {transfer.symbol || "TOKEN"}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {formatAddress(transfer.from)} → {formatAddress(transfer.to)}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-gray-400 font-mono">
          {formatAddress(transfer.token)}
        </div>
      </div>
    </div>
  );
}

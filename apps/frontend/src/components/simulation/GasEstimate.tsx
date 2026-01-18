interface Props {
  estimate: string;
}

export function GasEstimate({ estimate }: Props) {
  // Format gas number with commas
  const formatGas = (gas: string) => {
    if (gas === "unknown") return "Unable to estimate";
    try {
      return parseInt(gas).toLocaleString();
    } catch {
      return gas;
    }
  };

  // Estimate cost in ETH (assuming 30 gwei gas price)
  const estimateCost = (gas: string) => {
    if (gas === "unknown") return null;
    try {
      const gasNum = parseInt(gas);
      const gasPriceGwei = 30; // Assumed gas price
      const costWei = BigInt(gasNum) * BigInt(gasPriceGwei) * BigInt(1e9);
      const costEth = Number(costWei) / 1e18;
      return costEth.toFixed(6);
    } catch {
      return null;
    }
  };

  const cost = estimateCost(estimate);

  return (
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
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
          />
        </svg>
        Gas Estimate
      </h3>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {formatGas(estimate)}
          </div>
          <div className="text-sm text-gray-500">gas units</div>
        </div>

        {cost && (
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-700">
              ~{cost} ETH
            </div>
            <div className="text-xs text-gray-400">@ 30 gwei</div>
          </div>
        )}
      </div>
    </div>
  );
}

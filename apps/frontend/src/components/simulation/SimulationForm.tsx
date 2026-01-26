import { useState } from "react";
import { useAccount } from "wagmi";
import type { SimulationRequest } from "../../types/simulation";

interface Props {
  onSimulate: (request: SimulationRequest) => void;
  isLoading: boolean;
}

export function SimulationForm({ onSimulate, isLoading }: Props) {
  const { address, isConnected } = useAccount();

  const [formData, setFormData] = useState({
    to: "",
    value: "",
    data: "",
    gasLimit: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // Convert ETH to wei if value is provided
    let valueInWei = "0x0";
    if (formData.value) {
      try {
        const ethValue = parseFloat(formData.value);
        const weiValue = BigInt(Math.floor(ethValue * 1e18));
        valueInWei = "0x" + weiValue.toString(16);
      } catch {
        alert("Invalid ETH value");
        return;
      }
    }

    onSimulate({
      from: address,
      to: formData.to,
      value: valueInWei,
      data: formData.data || "0x",
      gasLimit: formData.gasLimit || undefined,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-main rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Transaction Details</h2>
          <p className="text-xs text-gray-500">Enter the transaction parameters</p>
        </div>
      </div>

      {/* From Address (Read-only) */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          From Address
        </label>
        <div className="relative">
          <input
            type="text"
            value={address || "Connect wallet to continue"}
            disabled
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-gray-500 text-sm font-mono"
          />
          {address && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              Connected
            </span>
          )}
        </div>
      </div>

      {/* To Address */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          To Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="to"
          value={formData.to}
          onChange={handleChange}
          placeholder="0x..."
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-eth-500/20 focus:border-eth-500 outline-none transition-all"
        />
      </div>

      {/* Value (ETH) */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Value (ETH)
        </label>
        <div className="relative">
          <input
            type="text"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder="0.0"
            className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-eth-500/20 focus:border-eth-500 outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
            ETH
          </span>
        </div>
      </div>

      {/* Data (Calldata) */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Data (Calldata)
        </label>
        <textarea
          name="data"
          value={formData.data}
          onChange={handleChange}
          placeholder="0x..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-eth-500/20 focus:border-eth-500 outline-none transition-all resize-none"
        />
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Optional: hex-encoded calldata for contract interactions
        </p>
      </div>

      {/* Gas Limit */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Gas Limit
        </label>
        <input
          type="text"
          name="gasLimit"
          value={formData.gasLimit}
          onChange={handleChange}
          placeholder="Auto-estimate"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-eth-500/20 focus:border-eth-500 outline-none transition-all"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isConnected || isLoading}
        className="w-full btn-gradient text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            Simulating...
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Simulate Transaction
          </>
        )}
      </button>

      {!isConnected && (
        <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect your wallet to simulate transactions
        </p>
      )}
    </form>
  );
}

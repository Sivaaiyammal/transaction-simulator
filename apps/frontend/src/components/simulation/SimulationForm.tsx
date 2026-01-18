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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Transaction Details
      </h2>

      {/* From Address (Read-only) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Address
        </label>
        <input
          type="text"
          value={address || "Connect wallet to continue"}
          disabled
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm"
        />
      </div>

      {/* To Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="to"
          value={formData.to}
          onChange={handleChange}
          placeholder="0x..."
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-eth-500 focus:border-eth-500 outline-none"
        />
      </div>

      {/* Value (ETH) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value (ETH)
        </label>
        <input
          type="text"
          name="value"
          value={formData.value}
          onChange={handleChange}
          placeholder="0.0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-eth-500 focus:border-eth-500 outline-none"
        />
      </div>

      {/* Data (Calldata) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data (Calldata)
        </label>
        <textarea
          name="data"
          value={formData.data}
          onChange={handleChange}
          placeholder="0x..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-eth-500 focus:border-eth-500 outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: hex-encoded calldata for contract interactions
        </p>
      </div>

      {/* Gas Limit */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gas Limit
        </label>
        <input
          type="text"
          name="gasLimit"
          value={formData.gasLimit}
          onChange={handleChange}
          placeholder="Auto-estimate"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-eth-500 focus:border-eth-500 outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isConnected || isLoading}
        className="w-full bg-eth-600 hover:bg-eth-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
        <p className="text-center text-sm text-gray-500 mt-3">
          Connect your wallet to simulate transactions
        </p>
      )}
    </form>
  );
}

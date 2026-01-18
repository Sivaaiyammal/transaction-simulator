import type { DecodedError } from "../../types/simulation";

interface Props {
  error: DecodedError;
  gasEstimate: string | null;
}

export function ErrorDisplay({ error, gasEstimate }: Props) {
  const getErrorTypeLabel = (type: DecodedError["type"]) => {
    switch (type) {
      case "revert":
        return "Revert";
      case "panic":
        return "Panic";
      case "custom":
        return "Custom Error";
      default:
        return "Error";
    }
  };

  const getErrorTypeColor = (type: DecodedError["type"]) => {
    switch (type) {
      case "panic":
        return "bg-red-100 text-red-800";
      case "custom":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-red-800 font-medium">{error.message}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getErrorTypeColor(
                  error.type
                )}`}
              >
                {getErrorTypeLabel(error.type)}
              </span>
            </div>
            <p className="text-red-600">{error.userMessage}</p>
          </div>
        </div>
      </div>

      {/* Suggestion Box */}
      {error.suggestion && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-blue-800 font-medium text-sm mb-1">Suggestion</h4>
              <p className="text-blue-700 text-sm">{error.suggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Error Details</h3>

        <div className="space-y-3">
          {/* Error Type */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-gray-900 capitalize">
              {error.type}
            </span>
          </div>

          {/* Panic Code */}
          {error.panicCode !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Panic Code</span>
              <span className="font-mono text-gray-900">
                0x{error.panicCode.toString(16)}
              </span>
            </div>
          )}

          {/* Selector */}
          {error.selector && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Selector</span>
              <span className="font-mono text-gray-900">{error.selector}</span>
            </div>
          )}

          {/* Gas Estimate (if available) */}
          {gasEstimate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gas Estimate</span>
              <span className="font-medium text-gray-900">
                {parseInt(gasEstimate).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Raw Error Data */}
        {error.raw && error.raw !== "0x" && error.raw.length > 2 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Raw Error Data</h4>
            <code className="block text-xs bg-gray-50 p-2 rounded overflow-x-auto font-mono text-gray-600 break-all">
              {error.raw}
            </code>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <strong>Note:</strong> This error occurred during simulation. The
        transaction was not sent on-chain and no gas was spent.
      </div>
    </div>
  );
}

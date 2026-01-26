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
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 card-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-red-800 font-bold text-lg">{error.message}</h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getErrorTypeColor(
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
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-5 card-shadow">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg
                className="w-5 h-5 text-white"
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
              <h4 className="text-sky-800 font-bold text-sm mb-1">Suggestion</h4>
              <p className="text-sky-700">{error.suggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Error Details
        </h3>

        <div className="space-y-3">
          {/* Error Type */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Type</span>
            <span className="font-semibold text-gray-900 capitalize">
              {error.type}
            </span>
          </div>

          {/* Panic Code */}
          {error.panicCode !== undefined && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Panic Code</span>
              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-gray-900">
                0x{error.panicCode.toString(16)}
              </span>
            </div>
          )}

          {/* Selector */}
          {error.selector && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Selector</span>
              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-gray-900">{error.selector}</span>
            </div>
          )}

          {/* Gas Estimate (if available) */}
          {gasEstimate && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Gas Estimate</span>
              <span className="font-semibold text-gray-900">
                {parseInt(gasEstimate).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Raw Error Data */}
        {error.raw && error.raw !== "0x" && error.raw.length > 2 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">Raw Error Data</h4>
            <code className="block text-xs bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto font-mono break-all">
              {error.raw}
            </code>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-gray-600 flex items-center gap-3">
        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Note:</strong> This error occurred during simulation. The
          transaction was not sent on-chain and no gas was spent.
        </span>
      </div>
    </div>
  );
}

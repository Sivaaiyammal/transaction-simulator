import { useState } from "react";
import type { SimulationRequest, SimulationResult } from "../../types/simulation";

interface Props {
  request: SimulationRequest | null;
  response: SimulationResult | null;
}

export function JsonViewer({ request, response }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "response">("request");

  if (!request && !response) return null;

  const formatJson = (data: unknown) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">Developer View</h3>
            <p className="text-xs text-gray-500">View raw JSON request & response</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("request")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "request"
                  ? "text-eth-600 border-b-2 border-eth-600 bg-eth-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Request
            </button>
            <button
              onClick={() => setActiveTab("response")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "response"
                  ? "text-eth-600 border-b-2 border-eth-600 bg-eth-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Response
            </button>
          </div>

          {/* JSON Display */}
          <div className="p-4">
            <div className="relative">
              <pre className="code-block max-h-80 overflow-auto text-xs">
                <code>
                  {activeTab === "request"
                    ? formatJson(request)
                    : formatJson(response)}
                </code>
              </pre>

              {/* Copy Button */}
              <button
                onClick={() => {
                  const text = activeTab === "request"
                    ? formatJson(request)
                    : formatJson(response);
                  navigator.clipboard.writeText(text);
                }}
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>

            {/* API Endpoint Info */}
            {activeTab === "request" && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">API Endpoint</p>
                <code className="text-sm font-mono text-gray-700">POST /api/simulate</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

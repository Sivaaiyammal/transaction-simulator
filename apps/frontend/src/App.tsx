import { useState } from "react";
import { Header } from "./components/layout/Header";
import { SimulationForm } from "./components/simulation/SimulationForm";
import { SimulationResult } from "./components/simulation/SimulationResult";
import { JsonViewer } from "./components/simulation/JsonViewer";
import { useSimulation } from "./hooks/useSimulation";
import type { SimulationRequest, ApprovalChange } from "./types/simulation";

function App() {
  const simulation = useSimulation();
  const [lastRequest, setLastRequest] = useState<SimulationRequest | null>(null);

  const handleSimulate = (request: SimulationRequest) => {
    setLastRequest(request);
    simulation.mutate(request);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Arbitrum Simulation & Risk Engine
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Transaction Simulator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Preview your Arbitrum transactions before sending. See gas costs,
            risk analysis, and potential errors without risking your funds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Simulation Form */}
          <div className="space-y-6">
            <SimulationForm
              onSimulate={handleSimulate}
              isLoading={simulation.isPending}
            />
          </div>

          {/* Results */}
          <div className="space-y-6">
            {simulation.data && (
              <>
                {simulation.data.success ? (
                  <>
                    {/* Risk Analysis Card */}
                    {(() => {
                      const risks: string[] = [];
                      // Check for unlimited approvals
                      simulation.data.approvalChanges?.forEach((a: ApprovalChange) => {
                        if (a.isUnlimited) {
                          risks.push(`⚠️ Unlimited ${a.symbol || "Token"} Approval detected`);
                        }
                      });
                      // Check for high gas usage (Arbitrum specific heuristic)
                      if (simulation.data.gasEstimate && parseInt(simulation.data.gasEstimate) > 5000000) {
                        risks.push(`⛽ High Gas Usage (>5M). Ensure this is expected.`);
                      }

                      if (risks.length > 0) {
                        return (
                          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 card-shadow mb-6">
                            <h3 className="text-orange-900 font-bold text-lg mb-3 flex items-center gap-2">
                              🛡️ Risk Assessment
                            </h3>
                            <ul className="space-y-2">
                              {risks.map((r, i) => <li key={i} className="text-orange-800 font-medium flex items-start gap-2">{r}</li>)}
                            </ul>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <SimulationResult result={simulation.data} transactionRequest={lastRequest} />
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 card-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-red-900 font-bold text-lg mb-1">
                          {simulation.data.error?.message || "Transaction Failed"}
                        </h3>
                        <div className="mt-2">
                          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Why it failed</span>
                          <p className="text-red-800 mt-1 mb-3 leading-relaxed font-medium">
                            {simulation.data.error?.userMessage}
                          </p>
                        </div>
                        {simulation.data.error?.suggestion && (
                          <div className="bg-white/80 rounded-lg p-4 text-sm text-red-800 border border-red-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1 text-red-900 font-bold">
                              <span>💡 Suggestion:</span>
                            </div>
                            {simulation.data.error.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {simulation.error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 card-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-red-800 font-semibold mb-1">
                      Simulation Error
                    </h3>
                    <p className="text-red-600 text-sm">{simulation.error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {!simulation.data && !simulation.error && !simulation.isPending && (
              <div className="bg-white rounded-2xl card-shadow p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-gray-700 font-semibold mb-2">
                  Ready to Simulate
                </h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                  Fill in the transaction details and click "Simulate Transaction" to preview the outcome
                </p>
              </div>
            )}
          </div>
        </div>

        {/* JSON Viewer for Developers */}
        {(lastRequest || simulation.data) && (
          <div className="mt-8">
            <JsonViewer request={lastRequest} response={simulation.data ?? null} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 mt-auto bg-white">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Open source simulation engine for the Arbitrum ecosystem.{" "}
            <a
              href="https://github.com/Sivaaiyammal/transaction-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-eth-600 hover:text-eth-700 font-medium transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

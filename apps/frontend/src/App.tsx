import { useState } from "react";
import { Header } from "./components/layout/Header";
import { SimulationForm } from "./components/simulation/SimulationForm";
import { SimulationResult } from "./components/simulation/SimulationResult";
import { JsonViewer } from "./components/simulation/JsonViewer";
import { useSimulation } from "./hooks/useSimulation";
import type { SimulationRequest } from "./types/simulation";

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
          <div className="inline-flex items-center gap-2 bg-eth-100 text-eth-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Ethereum Simulation Engine
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Transaction Simulator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Preview your Ethereum transactions before sending. See gas costs,
            token transfers, and potential errors without risking your funds.
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
              <SimulationResult
                result={simulation.data}
                transactionRequest={lastRequest}
              />
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
            Open source simulation engine for the Ethereum ecosystem.{" "}
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

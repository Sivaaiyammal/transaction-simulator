import { useState } from "react";
import { Header } from "./components/layout/Header";
import { SimulationForm } from "./components/simulation/SimulationForm";
import { SimulationResult } from "./components/simulation/SimulationResult";
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transaction Simulator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preview your Ethereum transactions before sending. See gas costs,
            token transfers, and potential errors without risking your funds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Simulation Form */}
          <div>
            <SimulationForm
              onSimulate={handleSimulate}
              isLoading={simulation.isPending}
            />
          </div>

          {/* Results */}
          <div>
            {simulation.data && (
              <SimulationResult
                result={simulation.data}
                transactionRequest={lastRequest}
              />
            )}

            {simulation.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">
                  Simulation Error
                </h3>
                <p className="text-red-600 text-sm">{simulation.error.message}</p>
              </div>
            )}

            {!simulation.data && !simulation.error && !simulation.isPending && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
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
                <h3 className="text-gray-500 font-medium mb-2">
                  Ready to Simulate
                </h3>
                <p className="text-gray-400 text-sm">
                  Fill in the transaction details and click "Simulate Transaction"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Open source project for the Ethereum ecosystem.{" "}
            <a
              href="https://github.com"
              className="text-eth-600 hover:underline"
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

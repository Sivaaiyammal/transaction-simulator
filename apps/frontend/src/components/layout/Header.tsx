import { useAccount, useConnect, useDisconnect } from "wagmi";

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-gradient-main text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">TX Simulator</h1>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot"></span>
                  Ethereum Mainnet
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div>
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  {formatAddress(address)}
                </div>
                <button
                  onClick={() => disconnect()}
                  className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-white text-eth-700 hover:bg-white/90 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 text-center">
          <p className="text-xs text-white/60 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Simulation only — no transaction is sent without wallet confirmation
          </p>
        </div>
      </div>
    </header>
  );
}

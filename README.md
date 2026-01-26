# Transaction Simulator

**An open-source simulation engine for previewing Ethereum transactions before sending.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-627eea)](https://ethereum.org/)

---

## The Problem

Every year, users lose millions of dollars to failed transactions, unexpected reverts, and phishing attacks. Before sending ETH or interacting with smart contracts, users have no way to verify what will actually happen.

**Common issues:**
- Transactions fail and waste gas fees
- Unexpected token approvals grant access to attackers
- Phishing contracts drain wallets
- Complex DeFi interactions behave unexpectedly

## The Solution

This **simulation engine** lets you **preview any transaction before sending it on-chain**. See exactly what will happen - gas costs, token transfers, approvals, and potential errors - without risking your funds.

```
┌─────────────────────────────────────────────────────────────┐
│  Before Simulation          │  After Simulation             │
├─────────────────────────────┼───────────────────────────────┤
│  ❓ Will this succeed?       │  ✅ Transaction would succeed │
│  ❓ How much gas?            │  ⛽ 48,000 gas (~$2.50)       │
│  ❓ What tokens move?        │  💰 -100 USDC → Contract      │
│  ❓ Any hidden approvals?    │  ⚠️ Unlimited approval to X   │
└─────────────────────────────┴───────────────────────────────┘
```

## Features

### Core Simulation
- **Transaction Preview** - Simulate any transaction without sending it
- **Gas Estimation** - Know the exact gas cost before you send
- **Revert Detection** - Catch errors before they cost you money
- **Human-Readable Errors** - Understand why transactions fail

### Token Analysis
- **Transfer Detection** - See all ERC-20 token movements
- **Approval Tracking** - Identify dangerous unlimited approvals
- **Balance Changes** - Preview your balance after the transaction

### User Experience
- **MetaMask Integration** - Connect your wallet in one click
- **No Private Keys** - Your keys never leave your wallet
- **Open Source** - Fully transparent, auditable code

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Ethereum RPC URL (Alchemy, Infura, or public RPC)

### Installation

```bash
# Clone the repository
git clone https://github.com/anthropics/transaction-simulator.git
cd transaction-simulator

# Install backend dependencies
cd apps/backend
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ETHEREUM_RPC_URL

# Start the backend
npm run dev

# In a new terminal, install frontend dependencies
cd ../frontend
npm install

# Start the frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │   Wallet    │  │  Simulation │  │     Result Display      │   │
│  │  Connect    │  │    Form     │  │  (Gas, Tokens, Errors)  │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ POST /api/simulate
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Backend (Express)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │  Validation │─▶│  Simulator  │─▶│    Response Builder     │   │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘   │
│                          │                                        │
│         ┌────────────────┼────────────────┐                      │
│         ▼                ▼                ▼                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐              │
│  │   Error    │  │   Token    │  │      Gas       │              │
│  │  Decoder   │  │  Analyzer  │  │   Estimator    │              │
│  └────────────┘  └────────────┘  └────────────────┘              │
└───────────────────────────┬──────────────────────────────────────┘
                            │ eth_call / estimateGas
                            ▼
                    ┌───────────────┐
                    │ Ethereum RPC  │
                    │   (Mainnet)   │
                    └───────────────┘
```

## API Reference

### POST /api/simulate

Simulate a transaction and return detailed analysis.

**Request:**
```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0Ab2d",
  "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "value": "0x0",
  "data": "0xa9059cbb000000000000000000000000...",
  "gasLimit": "100000"
}
```

**Response (Success):**
```json
{
  "result": {
    "success": true,
    "gasEstimate": "48000",
    "returnData": "0x0000...0001",
    "ethTransfer": null,
    "tokenTransfers": [
      {
        "token": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "symbol": "USDT",
        "decimals": 6,
        "from": "0x742d35Cc...",
        "to": "0xRecipient...",
        "amount": "100000000",
        "formattedAmount": "100.0"
      }
    ],
    "approvalChanges": []
  }
}
```

**Response (Failure):**
```json
{
  "result": {
    "success": false,
    "error": {
      "type": "revert",
      "message": "Insufficient Balance",
      "userMessage": "You don't have enough tokens to complete this transfer.",
      "suggestion": "Check your token balance and try a smaller amount.",
      "raw": "0x08c379a0..."
    },
    "gasEstimate": null
  }
}
```

## Project Structure

```
transaction-simulator/
├── apps/
│   ├── backend/              # Express API server
│   │   ├── src/
│   │   │   ├── api/          # Route handlers
│   │   │   ├── core/         # Simulation engine
│   │   │   ├── types/        # TypeScript definitions
│   │   │   └── utils/        # Helpers (validation, RPC)
│   │   └── package.json
│   └── frontend/             # React application
│       ├── src/
│       │   ├── components/   # UI components
│       │   ├── hooks/        # React hooks
│       │   ├── lib/          # Utilities (wagmi, api)
│       │   └── types/        # TypeScript definitions
│       └── package.json
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── examples/                 # Sample transactions
├── CONTRIBUTING.md
└── README.md
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full roadmap.

### Current (v1.0)
- [x] Basic transaction simulation
- [x] Gas estimation
- [x] Revert reason decoding
- [x] ERC-20 transfer detection
- [x] Approval change tracking
- [x] MetaMask integration

### Next (v1.1)
- [ ] ERC-721/1155 NFT support
- [ ] Internal transaction tracing
- [ ] Gas optimization suggestions
- [ ] Transaction history

### Future (v2.0)
- [ ] Multi-chain support (Polygon, Arbitrum, Optimism)
- [ ] Transaction bundles
- [ ] Slippage prediction for swaps
- [ ] Browser extension

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

- This tool is for simulation only - it never executes real transactions
- No private keys are stored or transmitted
- All simulation happens via standard `eth_call` RPC method
- Open source for full transparency

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Open-source simulation engine built for the Ethereum ecosystem.**

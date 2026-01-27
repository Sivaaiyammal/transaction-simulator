# Roadmap

This document outlines the development roadmap for the Transaction Simulator project.

## Vision

Create the most comprehensive, user-friendly transaction simulation tool for Arbitrum and Ethereum users. Our goal is to help users understand exactly what will happen before they send any transaction, preventing costly mistakes and protecting against malicious contracts.

---

## Version 1.0 - Core Simulation (Current)

**Status: Complete**

The foundation of the Transaction Simulator with essential features for safe transaction preview.

### Features

- [x] **Transaction Simulation**
  - Execute `eth_call` against current blockchain state
  - Support for contract interactions and ETH transfers
  - Block tag selection (latest, pending)

- [x] **Gas Estimation**
  - Accurate gas unit estimation
  - Cost calculation in ETH

- [x] **Error Handling**
  - Revert reason decoding (Error(string))
  - Panic code interpretation (Solidity 0.8+)
  - Custom error detection

- [x] **Token Analysis**
  - ERC-20 transfer detection
  - Approval change tracking
  - Token metadata resolution (symbol, decimals)
  - Unlimited approval warnings

- [x] **User Interface**
  - MetaMask wallet connection
  - Transaction form with validation
  - Clear result visualization
  - Mobile-responsive design

- [x] **Arbitrum Support**
  - Arbitrum One mainnet RPC integration
  - Arbitrum Sepolia testnet support
  - Wallet connection with Arbitrum chains
  - Arbitrum-branded UI and messaging

---

## Version 1.1 - Enhanced Analysis

**Status: Planned**

Deeper transaction analysis for advanced users and DeFi interactions.

### Features

- [ ] **NFT Support**
  - ERC-721 transfer detection
  - ERC-1155 multi-token detection
  - NFT metadata preview (name, image)
  - Collection identification

- [ ] **Internal Transaction Tracing**
  - `debug_traceCall` integration
  - Internal call visualization
  - Multi-contract interaction mapping
  - Delegate call detection

- [ ] **Gas Optimization**
  - Gas breakdown by operation type
  - Optimization suggestions
  - Historical gas price comparison
  - Priority fee recommendations

- [ ] **Transaction History**
  - Local storage of past simulations
  - Quick re-simulate functionality
  - Export simulation results

- [ ] **Enhanced Error Messages**
  - Common DeFi error explanations
  - Suggested fixes for known errors
  - Link to relevant documentation

- [ ] **Arbitrum Protocol Support**
  - GMX trading error handling
  - Camelot DEX integration
  - Radiant lending protocol support
  - L2-specific gas optimization hints

---

## Version 1.2 - Multi-Chain Expansion

**Status: Planned**

Expand to support additional L2s and sidechains beyond Arbitrum.

### Features

- [ ] **Polygon**
  - Polygon PoS mainnet
  - Polygon-specific token detection
  - Bridge transaction support

- [ ] **Optimism**
  - OP Mainnet support
  - Superchain compatibility
  - L1 data fee estimation

- [ ] **Base**
  - Base mainnet support
  - Coinbase integration hints

- [ ] **Enhanced Chain Switching**
  - Automatic chain detection from wallet
  - Manual chain selection
  - Per-chain RPC configuration

---

## Version 2.0 - Advanced Features

**Status: Future**

Professional-grade features for power users and developers.

### Features

- [ ] **Transaction Bundles**
  - Simulate multiple transactions in sequence
  - State changes between transactions
  - Atomic bundle preview

- [ ] **DEX Simulation**
  - Swap route visualization
  - Slippage prediction
  - Price impact calculation
  - MEV exposure warnings

- [ ] **Time-Travel Simulation**
  - Simulate against historical blocks
  - "What-if" analysis
  - Fork state simulation

- [ ] **Browser Extension**
  - Intercept transactions before signing
  - Automatic simulation popup
  - Quick approve/reject
  - Works with any dApp

- [ ] **Developer SDK**
  - npm package for integration
  - Programmatic simulation API
  - Webhook notifications
  - CI/CD integration

---

## Version 2.1 - Enterprise & Security

**Status: Future**

Features for teams, auditors, and security researchers.

### Features

- [ ] **Contract Analysis**
  - Source code verification check
  - Known vulnerability detection
  - Audit status display
  - Proxy contract detection

- [ ] **Allowance Management**
  - Current approval overview
  - Revoke transaction generation
  - Approval history

- [ ] **Team Features**
  - Shared simulation history
  - Team notifications
  - Custom RPC endpoints
  - Usage analytics

- [ ] **API Access**
  - REST API for integrations
  - Rate limiting tiers
  - Webhook support
  - Batch simulation

---

## Contributing

We welcome contributions at any stage of the roadmap. Priority areas:

1. **High Impact**: Error message improvements, NFT support
2. **Community Requested**: Multi-chain support, browser extension
3. **Technical Debt**: Test coverage, documentation

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## Feedback

Have a feature request? Open an issue on GitHub with the `enhancement` label.

Want to sponsor a specific feature? Contact us to discuss accelerated development.

# Architecture

This document describes the technical architecture of the Transaction Simulator.

## System Overview

The Transaction Simulator is a full-stack application consisting of:

1. **Frontend** - React SPA with MetaMask integration
2. **Backend** - Express.js API server with simulation engine
3. **External** - Ethereum RPC node for blockchain interaction

```
┌─────────────────────────────────────────────────────────────────────┐
│                              User                                    │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │        MetaMask           │
                    │    (Wallet Provider)      │
                    └─────────────┬─────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                         Frontend (React)                             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │    wagmi     │  │   React      │  │     TailwindCSS            │ │
│  │  (Web3 SDK)  │  │   Query      │  │     (Styling)              │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘ │
│                                                                      │
│  Components:                                                         │
│  - Header (wallet connection)                                        │
│  - SimulationForm (transaction input)                                │
│  - SimulationResult (result display)                                 │
│  - ErrorDisplay, TokenTransferCard, GasEstimate                      │
│                                                                      │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP (POST /api/simulate)
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                         Backend (Express)                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      API Layer                                │   │
│  │  simulate.route.ts - Request validation & response formatting │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                  │                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Core Layer                               │   │
│  │                                                               │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │   │
│  │  │  simulateTx    │  │  errorDecoder  │  │ tokenAnalyzer  │  │   │
│  │  │                │  │                │  │                │  │   │
│  │  │  Orchestrates  │  │  Decodes:      │  │  Detects:      │  │   │
│  │  │  eth_call,     │  │  - Revert msgs │  │  - ERC20       │  │   │
│  │  │  gas estimate, │  │  - Panic codes │  │    transfers   │  │   │
│  │  │  token analysis│  │  - Custom errs │  │  - Approvals   │  │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                  │                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Utils Layer                              │   │
│  │  validation.ts - Input validation                             │   │
│  │  rpc.ts - Ethereum provider setup                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ JSON-RPC
                                  │
┌─────────────────────────────────▼───────────────────────────────────┐
│                         Ethereum Node                                │
│                                                                      │
│  Methods used:                                                       │
│  - eth_call (simulate transaction)                                   │
│  - eth_estimateGas (gas estimation)                                  │
│  - eth_call to ERC20 contracts (token metadata)                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Core Modules

#### 1. Simulation Engine (`core/simulateTx.ts`)

The main orchestrator for transaction simulation.

**Responsibilities:**
- Execute `eth_call` to simulate transaction
- Estimate gas using `eth_estimateGas`
- Coordinate token analysis
- Build response with all collected data

**Flow:**
```
Input (ValidatedSimulationRequest)
         │
         ▼
┌────────────────────────────────────────┐
│  Parallel Execution:                   │
│  1. provider.call() - simulate tx      │
│  2. provider.estimateGas() - gas cost  │
│  3. tokenAnalyzer.analyze() - tokens   │
└────────────────────────────────────────┘
         │
         ▼
    Build Response
         │
         ├─── Success: SimulationSuccess
         │    - gasEstimate
         │    - returnData
         │    - tokenTransfers
         │    - approvalChanges
         │    - ethTransfer
         │
         └─── Failure: SimulationFailure
              - error (decoded)
              - gasEstimate (if available)
```

#### 2. Error Decoder (`core/errorDecoder.ts`)

Transforms raw error data into human-readable messages.

**Supported Error Types:**

| Type | Selector | Example |
|------|----------|---------|
| Error(string) | 0x08c379a0 | "Insufficient balance" |
| Panic(uint256) | 0x4e487b71 | Overflow, array bounds |
| Custom errors | Various | Protocol-specific errors |

**Panic Codes:**
```
0x01 - Assert failed
0x11 - Arithmetic overflow/underflow
0x12 - Division by zero
0x21 - Invalid enum value
0x31 - Pop on empty array
0x32 - Array index out of bounds
0x41 - Too much memory allocated
```

#### 3. Token Analyzer (`core/tokenAnalyzer.ts`)

Detects ERC-20 token operations in transactions.

**Detection Methods:**

1. **Transfer Detection** - Parses `transfer()` and `transferFrom()` calldata
2. **Approval Detection** - Parses `approve()` calldata
3. **Metadata Fetching** - Calls `symbol()` and `decimals()` on token contracts

**Function Selectors:**
```
transfer(address,uint256)       - 0xa9059cbb
transferFrom(address,address,uint256) - 0x23b872dd
approve(address,uint256)        - 0x095ea7b3
```

### Type System

The backend uses TypeScript with strict mode and discriminated unions for type safety.

```typescript
// Discriminated union for simulation results
type SimulationResult = SimulationSuccess | SimulationFailure;

interface SimulationSuccess {
  success: true;  // Discriminant
  gasEstimate: string;
  returnData: string;
  tokenTransfers: TokenTransfer[];
  approvalChanges: ApprovalChange[];
  ethTransfer: EthTransfer | null;
}

interface SimulationFailure {
  success: false;  // Discriminant
  error: DecodedError;
  gasEstimate: string | null;
}
```

### Validation

Input validation happens at the API layer before simulation.

**Validated Fields:**
- `from` - Valid Ethereum address (0x + 40 hex chars)
- `to` - Valid Ethereum address
- `value` - Valid numeric string (decimal or hex)
- `data` - Valid hex string
- `gasLimit` - Optional valid numeric string

## Frontend Architecture

### State Management

- **Wallet State** - Managed by wagmi hooks (`useAccount`, `useConnect`)
- **Simulation State** - Managed by React Query (`useMutation`)
- **Form State** - Local React state (`useState`)

### Component Hierarchy

```
App
├── Header
│   └── ConnectButton (wagmi)
├── SimulationForm
│   ├── Input fields (from, to, value, data, gasLimit)
│   └── Submit button
└── SimulationResult
    ├── GasEstimate
    ├── TokenTransferCard (for each transfer)
    ├── ApprovalCard (for each approval)
    └── ErrorDisplay (if failed)
```

### Styling

Uses TailwindCSS for utility-first styling with custom Ethereum-themed colors:

```javascript
colors: {
  eth: {
    500: '#627eea',  // Ethereum purple
    600: '#4c5fe0',
    700: '#3f4cc5',
  }
}
```

## Data Flow

### Successful Simulation

```
1. User connects wallet (MetaMask)
2. User fills transaction form
3. Frontend validates input
4. POST /api/simulate with transaction data
5. Backend validates request
6. Backend executes eth_call
7. Backend analyzes for tokens/approvals
8. Backend returns SimulationSuccess
9. Frontend displays results
```

### Failed Simulation

```
1-5. Same as above
6. Backend eth_call throws error
7. Backend extracts error data
8. Backend decodes error message
9. Backend returns SimulationFailure
10. Frontend displays error with explanation
```

## Security Considerations

### No Private Keys

The system never handles private keys:
- Frontend only uses MetaMask for address (not signing)
- Backend only receives unsigned transaction data
- No wallet connections to backend

### Input Validation

All user input is validated:
- Address format checking
- Hex data validation
- Numeric bounds checking

### Read-Only Operations

All blockchain interactions are read-only:
- `eth_call` - Does not modify state
- `eth_estimateGas` - Does not modify state
- Token metadata calls - Standard view functions

## Extension Points

### Adding New Chains

1. Add chain configuration to `lib/wagmi.ts`
2. Add RPC URL environment variable
3. Update `utils/rpc.ts` to support chain selection
4. Add chain parameter to simulation request

### Adding NFT Support

1. Add ERC-721/1155 ABIs to `tokenAnalyzer.ts`
2. Add NFT transfer event parsing
3. Update `TokenTransfer` type for NFT data
4. Add NFT display component to frontend

### Adding Trace Analysis

1. Integrate `debug_traceCall` RPC method
2. Parse internal transactions from trace
3. Add trace data to response type
4. Add trace visualization to frontend

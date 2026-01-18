# Example Transactions

This directory contains example transaction payloads for testing and demonstrating the Transaction Simulator.

## Usage

You can use these examples with curl or any HTTP client:

```bash
curl -X POST http://localhost:4000/api/simulate \
  -H "Content-Type: application/json" \
  -d @examples/transfer-eth.json
```

Or import them into your frontend by pasting the request body into the form's data field.

## Examples

### Basic Transactions

| File | Description |
|------|-------------|
| [transfer-eth.json](./transfer-eth.json) | Simple ETH transfer between addresses |
| [erc20-transfer.json](./erc20-transfer.json) | USDT token transfer |
| [erc20-approve.json](./erc20-approve.json) | Token approval (unlimited) |

### DeFi Transactions

| File | Description |
|------|-------------|
| [uniswap-swap.json](./uniswap-swap.json) | Token swap on Uniswap V3 |

### Error Cases

| File | Description |
|------|-------------|
| [revert-insufficient-balance.json](./revert-insufficient-balance.json) | Expected failure due to insufficient balance |

## Notes

- Replace `YOUR_ADDRESS` with your actual Ethereum address
- These examples use mainnet contract addresses
- Some transactions may fail if you don't have sufficient balance
- All transactions are simulated - no real ETH is spent

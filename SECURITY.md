# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email your findings to: [security@your-domain.com]
3. Include detailed steps to reproduce the vulnerability
4. Allow reasonable time for us to address the issue before public disclosure

### What to Include

- Type of vulnerability
- Full paths of affected source files
- Step-by-step instructions to reproduce
- Proof of concept or exploit code (if possible)
- Impact assessment

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution Target**: Within 30 days (depending on complexity)

## Security Measures

This project implements several security measures:

### No Private Key Exposure
- User wallets connect via MetaMask (Web3 injection)
- Private keys never leave the user's wallet
- No private keys are stored or transmitted by this application

### Read-Only Operations
- All simulations use `eth_call` (does not modify blockchain state)
- Gas estimation uses `eth_estimateGas` (read-only)
- Token analysis uses view functions only

### Input Validation
- All API inputs are validated before processing
- Strict address format checking (0x + 40 hex characters)
- Hex data validation for calldata
- Numeric bounds checking for values and gas limits

### Rate Limiting
- API endpoints are rate-limited to prevent abuse
- Configurable limits for production environments

### CORS Configuration
- CORS is configurable via environment variables
- Production deployments should restrict to specific frontend domains

## Best Practices for Deployment

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **RPC Provider**: Use a trusted RPC provider (Alchemy, Infura)
3. **HTTPS**: Always deploy behind HTTPS in production
4. **CORS**: Restrict CORS origins to your frontend domain
5. **Rate Limiting**: Configure appropriate rate limits for your use case

## Audit Status

This project has not yet undergone a formal security audit. We recommend users:
- Review the source code before using in production
- Use simulation results as guidance, not guarantees
- Always verify transactions independently before sending

## Scope

This security policy covers:
- The backend API (`apps/backend`)
- The frontend application (`apps/frontend`)
- Documentation and examples

Out of scope:
- Third-party dependencies (report to respective maintainers)
- Blockchain network issues
- User wallet security

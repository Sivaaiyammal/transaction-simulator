# Contributing to Transaction Simulator

Thank you for your interest in contributing to the Transaction Simulator! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- An Ethereum RPC URL (Alchemy, Infura, or public RPC)

### Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/transaction-simulator.git
cd transaction-simulator
```

2. **Set up the backend**

```bash
cd apps/backend
npm install
cp .env.example .env
# Edit .env and add your ETHEREUM_RPC_URL
npm run dev
```

3. **Set up the frontend** (in a new terminal)

```bash
cd apps/frontend
npm install
npm run dev
```

4. **Verify the setup**

- Backend should be running on http://localhost:4000
- Frontend should be running on http://localhost:3000
- The health endpoint should respond: `curl http://localhost:4000/api/health`

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/nft-support` - New features
- `fix/gas-estimation-bug` - Bug fixes
- `docs/api-examples` - Documentation updates
- `refactor/error-handling` - Code refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```
feat(token): add ERC-721 transfer detection
fix(error): handle empty revert data correctly
docs(api): add examples for simulation endpoint
```

### Code Style

**TypeScript:**
- Use strict mode (already configured)
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for result types
- Document public functions with JSDoc

**React:**
- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic into custom hooks

**General:**
- No unused imports or variables
- No `any` types (use `unknown` and narrow)
- Prefer `async/await` over Promise chains

### Testing

Before submitting a PR, ensure:

1. The backend compiles: `cd apps/backend && npm run build`
2. The frontend compiles: `cd apps/frontend && npm run build`
3. Manual testing of affected features

## Pull Request Process

### Before Submitting

1. Update documentation if adding new features
2. Add/update tests if applicable
3. Ensure your branch is up to date with `main`

### PR Template

When opening a PR, include:

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How did you test these changes?

## Screenshots (if applicable)
Include screenshots for UI changes.
```

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge the PR

## Code Architecture

### Backend Structure

```
apps/backend/src/
├── api/          # Express route handlers
├── core/         # Business logic
│   ├── simulateTx.ts    # Main simulation orchestrator
│   ├── errorDecoder.ts  # Error parsing
│   └── tokenAnalyzer.ts # Token detection
├── types/        # TypeScript interfaces
└── utils/        # Helper functions
```

### Frontend Structure

```
apps/frontend/src/
├── components/   # React components
│   ├── layout/   # Header, Footer
│   ├── simulation/ # Form, Results
│   └── ui/       # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Utilities (wagmi config, API)
└── types/        # TypeScript interfaces
```

### Key Design Decisions

1. **Discriminated Unions** - Result types use `success: true/false` for type narrowing
2. **Parallel Execution** - Gas estimation and token analysis run in parallel
3. **Graceful Degradation** - Token metadata failures don't break simulation
4. **No Private Keys** - Design ensures no key exposure

## Adding New Features

### Adding a New Error Type

1. Update `KNOWN_CUSTOM_ERRORS` in `errorDecoder.ts`
2. Add decoding logic if needed
3. Update `DecodedError` type if new fields needed
4. Update `ErrorDisplay` component in frontend

### Adding a New Token Standard

1. Add ABI constants to `tokenAnalyzer.ts`
2. Add function selector detection
3. Create new interface (e.g., `NFTTransfer`)
4. Update `SimulationSuccess` type
5. Create frontend display component

### Adding a New Chain

1. Add chain to `wagmi.ts` configuration
2. Add RPC URL to `.env.example`
3. Update `rpc.ts` for chain selection
4. Add chain to frontend chain selector

## Reporting Issues

### Bug Reports

Include:
- Steps to reproduce
- Expected vs actual behavior
- Transaction details (if applicable)
- Browser/environment info

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

## Community

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and general discussion

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Transaction Simulator!

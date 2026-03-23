# FFE Social Engine

AI-powered social content creation platform for Firefly Events.

## Architecture
- **Monorepo**: pnpm workspaces + Turborepo
- **Apps**: Next.js dashboard, Express API gateway
- **Services**: Python FastAPI (voice-gen, visual-gen), Node.js (composer, text-gen)
- **Packages**: Shared types (core), Prisma DB layer (db)

## Development
```bash
pnpm install
pnpm dev        # Start all services
pnpm build      # Build all packages
pnpm test       # Run all tests
pnpm lint       # Lint all packages
```

## Quality Standards (MANDATORY)
- Every PR MUST include tests
- Every PR MUST pass linting
- NEVER commit node_modules/, coverage/, dist/, .env
- All services must have health check endpoints
- Python services: pytest + ruff linting
- Node services: jest/vitest + eslint

## Repo Conventions
- PRs target `main` branch
- Commit format: `feat(service-name): description` or `fix(service-name): description`
- Each service has its own Dockerfile
- Shared types go in `packages/core`

## Linear Project
FFE Social Engine — tickets FIR-1139 through FIR-1149+

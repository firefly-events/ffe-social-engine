# Secrets Management — Social Engine

All secrets are stored in **GCP Secret Manager** (project: `ffe-cicd`).

Naming convention: `social-engine-{env}-{var-name}`

## Quick Start

### Pull secrets for local development
```bash
./scripts/secrets/pull-secrets.sh dev
```
Writes to `apps/dashboard/.env.local` (gitignored).

### Push new/updated secrets to GCP SM
```bash
./scripts/secrets/push-secrets.sh dev
./scripts/secrets/push-secrets.sh prod
```
Reads from `apps/dashboard/.env.local` or `.env.production`.

### Wire all env vars into Vercel
```bash
./scripts/secrets/setup-vercel-env.sh
```
Pulls from GCP SM and sets via `vercel env add`. Run once per Vercel project setup.

## Secret Inventory

| GCP SM Name | Env Var | Notes |
|-------------|---------|-------|
| `social-engine-dev-clerk-publishable-key` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `social-engine-dev-clerk-secret-key` | `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `social-engine-dev-clerk-webhook-secret` | `CLERK_WEBHOOK_SECRET` | Clerk Webhooks → signing secret |
| `social-engine-dev-convex-url` | `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard → deployment URL |
| `social-engine-dev-convex-deployment` | `CONVEX_DEPLOYMENT` | Convex dashboard → deployment slug |
| `social-engine-dev-zernio-api-key` | `ZERNIO_API_KEY` | ALREADY VAULTED — verify present |
| `social-engine-dev-google-api-key` | `GOOGLE_API_KEY` | TTA GCP project → API keys |
| `social-engine-dev-google-maps-api-key` | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | TTA GCP project → API keys |
| `social-engine-dev-posthog-key` | `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project settings |
| `social-engine-dev-sentry-dsn` | `SENTRY_DSN` | Sentry → Project settings → DSN |
| `social-engine-dev-stripe-secret-key` | `STRIPE_SECRET_KEY` | Stripe dashboard → API keys |
| `social-engine-dev-stripe-publishable-key` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → API keys |
| `social-engine-dev-stripe-webhook-secret` | `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → signing secret |

Replace `dev` with `prod` for production variants.

## Verify secrets exist

```bash
gcloud secrets list --project=ffe-cicd --filter="name:social-engine-dev"
gcloud secrets list --project=ffe-cicd --filter="name:social-engine-prod"
```

## Prerequisites

- `gcloud` CLI: `brew install google-cloud-sdk`
- Auth: `gcloud auth login && gcloud config set project ffe-cicd`
- Vercel CLI: `npm i -g vercel && vercel login`

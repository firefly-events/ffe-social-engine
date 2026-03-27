#!/usr/bin/env bash
set -euo pipefail

# sync-vercel.sh — Sync secrets from GCP Secret Manager (via SYNC_* env vars)
# to Vercel project environment variables.
#
# Required env vars: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
# Secret env vars:   SYNC_CLERK_PUBLISHABLE_KEY, SYNC_CLERK_SECRET_KEY, etc.

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "ERROR: VERCEL_TOKEN is required" >&2
  exit 1
fi

if [[ -z "${VERCEL_ORG_ID:-}" ]]; then
  echo "ERROR: VERCEL_ORG_ID is required" >&2
  exit 1
fi

if [[ -z "${VERCEL_PROJECT_ID:-}" ]]; then
  echo "ERROR: VERCEL_PROJECT_ID is required" >&2
  exit 1
fi

VERCEL_FLAGS="--token=${VERCEL_TOKEN}"

sync_env() {
  local name="$1"
  local value="$2"
  echo "Syncing: ${name}"
  printf '%s' "${value}" | npx vercel env add "${name}" production preview development ${VERCEL_FLAGS} --force 2>/dev/null || true
}

# Secrets from GCP SM (passed via SYNC_* env vars)
sync_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "${SYNC_CLERK_PUBLISHABLE_KEY:-}"
sync_env "CLERK_SECRET_KEY"                  "${SYNC_CLERK_SECRET_KEY:-}"
sync_env "NEXT_PUBLIC_CONVEX_URL"            "${SYNC_CONVEX_URL:-}"
sync_env "CONVEX_DEPLOYMENT"                 "${SYNC_CONVEX_DEPLOYMENT:-}"
sync_env "CONVEX_DEPLOY_KEY"                 "${SYNC_CONVEX_DEPLOY_KEY:-}"
sync_env "ZERNIO_API_KEY"                    "${SYNC_ZERNIO_API_KEY:-}"
sync_env "NEXT_PUBLIC_SENTRY_DSN"            "${SYNC_SENTRY_DSN:-}"
sync_env "SENTRY_DSN"                        "${SYNC_SENTRY_DSN:-}"
sync_env "NEXT_PUBLIC_POSTHOG_KEY"           "${SYNC_POSTHOG_KEY:-}"

# Hardcoded values
sync_env "NEXT_PUBLIC_POSTHOG_HOST"              "https://us.posthog.com"
sync_env "SENTRY_ORG"                            "firefly-events-inc"
sync_env "SENTRY_PROJECT"                        "social-engine"
sync_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL"         "/sign-in"
sync_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL"         "/sign-up"
sync_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"   "/dashboard"
sync_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"   "/dashboard"
sync_env "NEXT_PUBLIC_APP_URL"                   "https://social-engine-five.vercel.app"
sync_env "CLERK_JWT_ISSUER_DOMAIN"               "https://regular-ant-26.clerk.accounts.dev"

echo "All Vercel env vars synced."

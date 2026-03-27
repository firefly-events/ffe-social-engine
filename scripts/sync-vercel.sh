#!/usr/bin/env bash
set -euo pipefail

# sync-vercel.sh — Sync secrets from GCP Secret Manager (via SYNC_* env vars)
# to Vercel project environment variables.
#
# Usage: ./scripts/sync-vercel.sh [production|preview]
#
# Required env vars: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
# Secret env vars:   SYNC_CLERK_PUBLISHABLE_KEY, SYNC_CLERK_SECRET_KEY, etc.

ENVIRONMENT="${1:-preview}"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "ERROR: VERCEL_TOKEN is required" >&2
  exit 1
fi

VERCEL_FLAGS="--token=${VERCEL_TOKEN}"

# vercel_set: remove then add env var with retry. Fails script if all retries exhausted.
vercel_set() {
  local name="$1"
  local value="$2"
  local target="${3:-production preview development}"

  if [[ -z "${value}" ]]; then
    echo "SKIP (empty): ${name}"
    return 0
  fi

  echo "Syncing: ${name} → [${target}]"

  # Remove existing value (ignore errors if it doesn't exist)
  for t in ${target}; do
    npx vercel env rm "${name}" "${t}" ${VERCEL_FLAGS} --yes 2>/dev/null || true
  done

  # Add with retry
  local attempts=0
  local max_attempts=3
  while (( attempts < max_attempts )); do
    if printf '%s' "${value}" | npx vercel env add "${name}" ${target} ${VERCEL_FLAGS} 2>/dev/null; then
      return 0
    fi
    attempts=$((attempts + 1))
    echo "  Retry ${attempts}/${max_attempts} for ${name}..."
    sleep 2
  done

  echo "ERROR: Failed to set ${name} after ${max_attempts} attempts" >&2
  exit 1
}

# --- Secrets from GCP SM (passed via SYNC_* env vars) ---
vercel_set "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "${SYNC_CLERK_PUBLISHABLE_KEY:-}"
vercel_set "CLERK_SECRET_KEY"                  "${SYNC_CLERK_SECRET_KEY:-}"
vercel_set "CLERK_WEBHOOK_SECRET"              "${SYNC_CLERK_WEBHOOK_SECRET:-}"
vercel_set "CLERK_JWT_ISSUER_DOMAIN"           "${SYNC_CLERK_JWT_ISSUER_DOMAIN:-}"
vercel_set "NEXT_PUBLIC_CONVEX_URL"            "${SYNC_CONVEX_URL:-}"
vercel_set "CONVEX_DEPLOYMENT"                 "${SYNC_CONVEX_DEPLOYMENT:-}"
vercel_set "CONVEX_DEPLOY_KEY"                 "${SYNC_CONVEX_DEPLOY_KEY:-}"
vercel_set "ZERNIO_API_KEY"                    "${SYNC_ZERNIO_API_KEY:-}"
vercel_set "NEXT_PUBLIC_SENTRY_DSN"            "${SYNC_SENTRY_DSN:-}"
vercel_set "SENTRY_DSN"                        "${SYNC_SENTRY_DSN:-}"
vercel_set "NEXT_PUBLIC_POSTHOG_KEY"           "${SYNC_POSTHOG_KEY:-}"
vercel_set "GOOGLE_SERVICE_ACCOUNT_KEY"        "${SYNC_VERTEX_AI_SA_KEY:-}"
vercel_set "GOOGLE_CLOUD_PROJECT"              "${SYNC_GOOGLE_CLOUD_PROJECT:-}"
vercel_set "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"   "${SYNC_GOOGLE_MAPS_API_KEY:-}"

# --- Static config values ---
vercel_set "NEXT_PUBLIC_POSTHOG_HOST"              "https://us.posthog.com"
vercel_set "SENTRY_ORG"                            "firefly-events-inc"
vercel_set "SENTRY_PROJECT"                        "social-engine"
vercel_set "NEXT_PUBLIC_CLERK_SIGN_IN_URL"         "/sign-in"
vercel_set "NEXT_PUBLIC_CLERK_SIGN_UP_URL"         "/sign-up"
vercel_set "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"   "/dashboard"
vercel_set "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"   "/dashboard"

# --- Environment-specific app URL ---
if [[ "${ENVIRONMENT}" == "production" ]]; then
  vercel_set "NEXT_PUBLIC_APP_URL" "https://social-engine-five.vercel.app" "production"
else
  # Sanitize branch name for preview hostname (replace / with -)
  BRANCH="${GITHUB_HEAD_REF:-preview}"
  SAFE_BRANCH="$(echo "${BRANCH}" | sed 's|/|-|g' | head -c 50)"
  vercel_set "NEXT_PUBLIC_APP_URL" "https://social-engine-five-git-${SAFE_BRANCH}.vercel.app" "preview development"
fi

echo "All Vercel env vars synced for environment: ${ENVIRONMENT}"

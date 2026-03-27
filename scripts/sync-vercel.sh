#!/usr/bin/env bash
set -euo pipefail

# sync-vercel.sh — Sync secrets from GCP Secret Manager (via SYNC_* env vars)
# to Vercel project environment variables.
#
# Required env vars: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, SYNC_ENV
# Secret env vars:   SYNC_CLERK_PUBLISHABLE_KEY, SYNC_CLERK_SECRET_KEY, etc.

: "${VERCEL_TOKEN:?ERROR: VERCEL_TOKEN is required}"
: "${VERCEL_ORG_ID:?ERROR: VERCEL_ORG_ID is required}"
: "${VERCEL_PROJECT_ID:?ERROR: VERCEL_PROJECT_ID is required}"

# Accept SYNC_ENV from positional arg $1 or env var (env var takes precedence)
# This allows calling as: ./scripts/sync-vercel.sh production
# or with env var:        SYNC_ENV=production ./scripts/sync-vercel.sh
SYNC_ENV="${SYNC_ENV:-${1:-preview}}"

# Map sync env to Vercel target(s)
case "${SYNC_ENV}" in
  production)  TARGETS="production" ;;
  preview)     TARGETS="preview development" ;;
  *)           TARGETS="preview development" ;;
esac

VERCEL_FLAGS="--token=${VERCEL_TOKEN}"

echo "Syncing env vars for targets: ${TARGETS}"

# Sync a single env var to all targets
# Retries up to 3 times on transient failures (rate limits, network blips)
sync_env() {
  local name="$1"
  local value="$2"

  # Skip if value is empty
  if [[ -z "${value}" ]]; then
    echo "SKIP (empty): ${name}"
    return 0
  fi

  echo "Syncing: ${name}"
  for target in ${TARGETS}; do
    local attempt=0
    local max_attempts=3
    local synced=0
    # Retry loop handles transient Vercel API errors (429, 5xx, network blips)
    while (( attempt < max_attempts )); do
      attempt=$(( attempt + 1 ))
      # Remove existing value first to ensure clean update
      npx vercel env rm "${name}" "${target}" ${VERCEL_FLAGS} --yes 2>/dev/null || true
      if printf '%s' "${value}" | npx vercel env add "${name}" "${target}" ${VERCEL_FLAGS} 2>/dev/null; then
        synced=1
        break
      fi
      echo "  Attempt ${attempt}/${max_attempts} failed for ${name} (${target}), retrying..."
      sleep 2
    done
    if (( ! synced )); then
      echo "ERROR: failed to sync ${name} to ${target} after ${max_attempts} attempts" >&2
      return 1
    fi
  done
}

# --- Auth/Identity ---
sync_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "${SYNC_CLERK_PUBLISHABLE_KEY:-${CLERK_PUBLISHABLE_KEY:-}}"
sync_env "CLERK_SECRET_KEY"                  "${SYNC_CLERK_SECRET_KEY:-${CLERK_SECRET_KEY:-}}"
sync_env "CLERK_WEBHOOK_SECRET"              "${SYNC_CLERK_WEBHOOK_SECRET:-${CLERK_WEBHOOK_SECRET:-}}"
sync_env "CLERK_JWT_ISSUER_DOMAIN"           "${SYNC_CLERK_JWT_ISSUER_DOMAIN:-${CLERK_JWT_ISSUER_DOMAIN:-}}"

# --- Convex ---
sync_env "NEXT_PUBLIC_CONVEX_URL"            "${SYNC_CONVEX_URL:-${CONVEX_URL:-}}"
sync_env "CONVEX_DEPLOYMENT"                 "${SYNC_CONVEX_DEPLOYMENT:-${CONVEX_DEPLOYMENT:-}}"
sync_env "CONVEX_DEPLOY_KEY"                 "${SYNC_CONVEX_DEPLOY_KEY:-${CONVEX_DEPLOY_KEY:-}}"

# --- Integrations ---
sync_env "ZERNIO_API_KEY"                    "${SYNC_ZERNIO_API_KEY:-${ZERNIO_API_KEY:-}}"
sync_env "NEXT_PUBLIC_SENTRY_DSN"            "${SYNC_SENTRY_DSN:-${SENTRY_DSN:-}}"
sync_env "SENTRY_DSN"                        "${SYNC_SENTRY_DSN:-${SENTRY_DSN:-}}"
sync_env "NEXT_PUBLIC_POSTHOG_KEY"           "${SYNC_POSTHOG_KEY:-${POSTHOG_KEY:-}}"

# --- Google / Vertex AI ---
sync_env "GOOGLE_SERVICE_ACCOUNT_KEY"        "${SYNC_VERTEX_AI_SA_KEY:-${VERTEX_AI_SA_KEY:-}}"
sync_env "GOOGLE_CLOUD_PROJECT"              "${SYNC_GOOGLE_CLOUD_PROJECT:-${GOOGLE_CLOUD_PROJECT:-}}"
sync_env "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"   "${SYNC_GOOGLE_MAPS_API_KEY:-${GOOGLE_MAPS_API_KEY:-}}"

# --- Hardcoded values ---
sync_env "NEXT_PUBLIC_POSTHOG_HOST"             "https://us.posthog.com"
sync_env "SENTRY_ORG"                           "firefly-events-inc"
sync_env "SENTRY_PROJECT"                       "social-engine"
sync_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL"        "/sign-in"
sync_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL"        "/sign-up"
sync_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"  "/dashboard"
sync_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"  "/dashboard"

# App URL — dynamic per environment
if [[ "${SYNC_ENV}" == "production" ]]; then
  sync_env "NEXT_PUBLIC_APP_URL" "https://social-engine-five.vercel.app"
else
  BRANCH_SAFE="$(printf '%s' "${GITHUB_HEAD_REF:-preview}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9-]+/-/g; s/^-+//; s/-+$//')"
  sync_env "NEXT_PUBLIC_APP_URL" "https://social-engine-five-git-${BRANCH_SAFE:-preview}.vercel.app"
fi

echo "All Vercel env vars synced for: ${TARGETS}"

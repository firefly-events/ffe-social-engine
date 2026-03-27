#!/usr/bin/env bash
# =============================================================================
# scripts/sync-vercel.sh — Social Engine
# Syncs secrets from GCP SM (exported as env vars by GHA) into Vercel env vars.
#
# Usage (from GHA):
#   VERCEL_TOKEN=... VERCEL_ORG_ID=... VERCEL_PROJECT_ID=... \
#   SYNC_CLERK_PUBLISHABLE_KEY=... \
#   bash scripts/sync-vercel.sh [production|preview|development]
# =============================================================================
set -euo pipefail

ENVIRONMENT="${1:-preview}"
VERCEL_TOKEN="${VERCEL_TOKEN:?VERCEL_TOKEN is required}"
export VERCEL_ORG_ID="${VERCEL_ORG_ID:?VERCEL_ORG_ID is required}"
export VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is required}"

# Determine Vercel targets based on environment
if [[ "$ENVIRONMENT" == "production" ]]; then
  TARGETS="production"
else
  TARGETS="preview,development"
fi

set_vercel_env() {
  local var="$1"
  local value="$2"
  local targets="${3:-$TARGETS}"

  if [[ -z "$value" ]]; then
    echo "  SKIP: $var (empty value)"
    return
  fi

  # Remove existing (ignore errors — var might not exist yet)
  vercel env rm "$var" --yes --token="$VERCEL_TOKEN" 2>/dev/null || true

  # Add per target with retry
  IFS=',' read -ra target_list <<< "$targets"
  for target in "${target_list[@]}"; do
    local ok=false
    for attempt in 1 2 3; do
      if echo -n "$value" | vercel env add "$var" "$target" --token="$VERCEL_TOKEN"; then
        ok=true
        break
      fi
      [[ $attempt -lt 3 ]] && sleep 2
    done
    if [[ "$ok" == "false" ]]; then
      echo "ERROR: Failed to set $var for target=$target after 3 retries" >&2
      exit 1
    fi
  done
  echo "  SET: $var → $targets"
}

echo "=== Syncing Vercel env vars (environment: $ENVIRONMENT) ==="

# --- Secrets (pulled from GCP SM by GHA, passed as SYNC_* env vars) ---
set_vercel_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "${SYNC_CLERK_PUBLISHABLE_KEY:-}"
set_vercel_env "CLERK_SECRET_KEY"                  "${SYNC_CLERK_SECRET_KEY:-}"
set_vercel_env "CLERK_WEBHOOK_SECRET"              "${SYNC_CLERK_WEBHOOK_SECRET:-}"
set_vercel_env "NEXT_PUBLIC_CONVEX_URL"            "${SYNC_CONVEX_URL:-}"
set_vercel_env "CONVEX_DEPLOYMENT"                 "${SYNC_CONVEX_DEPLOYMENT:-}"
set_vercel_env "CONVEX_DEPLOY_KEY"                 "${SYNC_CONVEX_DEPLOY_KEY:-}"
set_vercel_env "ZERNIO_API_KEY"                    "${SYNC_ZERNIO_API_KEY:-}"
set_vercel_env "GOOGLE_API_KEY"                    "${SYNC_GOOGLE_API_KEY:-}" "production,preview,development"
set_vercel_env "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"   "${SYNC_GOOGLE_MAPS_API_KEY:-}" "production,preview,development"
set_vercel_env "NEXT_PUBLIC_POSTHOG_KEY"           "${SYNC_POSTHOG_KEY:-}" "production,preview,development"
set_vercel_env "NEXT_PUBLIC_SENTRY_DSN"            "${SYNC_SENTRY_DSN:-}" "production,preview,development"
set_vercel_env "SENTRY_DSN"                        "${SYNC_SENTRY_DSN:-}" "production,preview,development"
set_vercel_env "REPLICATE_API_TOKEN"               "${SYNC_REPLICATE_API_TOKEN:-}" "production,preview,development"

# --- Static / non-secret vars (always production,preview,development) ---
set_vercel_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL"         "/sign-in"                              "production,preview,development"
set_vercel_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL"         "/sign-up"                              "production,preview,development"
set_vercel_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"   "/dashboard"                            "production,preview,development"
set_vercel_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"   "/dashboard"                            "production,preview,development"
set_vercel_env "NEXT_PUBLIC_POSTHOG_HOST"              "https://us.posthog.com"                "production,preview,development"
set_vercel_env "NEXT_PUBLIC_APP_URL"                   "https://social-engine-five.vercel.app" "production"
set_vercel_env "SENTRY_ORG"                            "firefly-events-inc"                    "production,preview,development"
set_vercel_env "SENTRY_PROJECT"                        "social-engine"                         "production,preview,development"

echo ""
echo "=== Sync complete. Run 'vercel env ls' to verify. ==="

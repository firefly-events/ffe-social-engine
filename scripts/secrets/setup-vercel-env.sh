#!/usr/bin/env bash
# =============================================================================
# scripts/secrets/setup-vercel-env.sh — Social Engine
# Sync secrets from GCP Secret Manager to Vercel environment variables.
#
# Usage:
#   ./scripts/secrets/setup-vercel-env.sh [--env dev|prod|both] [--dry-run]
#
# In GHA: VERCEL_TOKEN env var is used automatically for --token auth.
# Locally: vercel CLI must be authenticated (vercel login).
#
# Prerequisites:
#   - gcloud CLI authenticated (WIF in GHA, or `gcloud auth login` locally)
#   - vercel CLI installed
#   - VERCEL_TOKEN env var (GHA) or interactive vercel login (local)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GCP_PROJECT="ffe-cicd"

# Parse args
SYNC_ENV="both"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --env)  SYNC_ENV="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    --help)
      echo "Usage: $0 [--env dev|prod|both] [--dry-run]"
      echo "  --env      Environment to sync (dev, prod, or both). Default: both"
      echo "  --dry-run  Show what would be synced without writing to Vercel"
      exit 0
      ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ "$SYNC_ENV" != "dev" && "$SYNC_ENV" != "prod" && "$SYNC_ENV" != "both" ]]; then
  echo "Error: --env must be dev, prod, or both"
  exit 1
fi

# Build --token flag if VERCEL_TOKEN is set (GHA mode)
VERCEL_TOKEN_FLAG=""
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  VERCEL_TOKEN_FLAG="--token=$VERCEL_TOKEN"
fi

# Vercel env mappings: VAR_NAME|gcp-secret-suffix|vercel-target(s)|env(dev/prod)
# dev secrets go to preview,development; prod secrets go to production
declare -a ENV_MAPPINGS=(
  # Clerk
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|clerk-publishable-key|preview,development|dev"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|clerk-publishable-key|production|prod"
  "CLERK_SECRET_KEY|clerk-secret-key|preview,development|dev"
  "CLERK_SECRET_KEY|clerk-secret-key|production|prod"
  # Convex
  "NEXT_PUBLIC_CONVEX_URL|convex-url|preview,development|dev"
  "NEXT_PUBLIC_CONVEX_URL|convex-url|production|prod"
  "CONVEX_DEPLOYMENT|convex-deployment|preview,development|dev"
  "CONVEX_DEPLOYMENT|convex-deployment|production|prod"
  "CONVEX_DEPLOY_KEY|convex-deploy-key|preview,development|dev"
  "CONVEX_DEPLOY_KEY|convex-deploy-key|production|prod"
  # API keys
  "ZERNIO_API_KEY|zernio-api-key|preview,development|dev"
  "ZERNIO_API_KEY|zernio-api-key|production|prod"
  # Observability
  "NEXT_PUBLIC_POSTHOG_KEY|posthog-key|preview,development,production|dev"
  "NEXT_PUBLIC_SENTRY_DSN|sentry-dsn|preview,development,production|dev"
  "SENTRY_DSN|sentry-dsn|preview,development,production|dev"
  # OAuth
  "OAUTH_TOKEN_ENCRYPTION_KEY|oauth-token-encryption-key|preview,development|dev"
  "OAUTH_TOKEN_ENCRYPTION_KEY|oauth-token-encryption-key|production|prod"
)

# Static (non-secret) vars — same for all environments
declare -A STATIC_VARS=(
  ["NEXT_PUBLIC_CLERK_SIGN_IN_URL"]="/sign-in"
  ["NEXT_PUBLIC_CLERK_SIGN_UP_URL"]="/sign-up"
  ["NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"]="/dashboard"
  ["NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"]="/dashboard"
  ["NEXT_PUBLIC_POSTHOG_HOST"]="https://us.posthog.com"
  ["SENTRY_ORG"]="firefly-events-inc"
  ["SENTRY_PROJECT"]="social-engine"
)

pull_secret() {
  local suffix="$1"
  local env="$2"
  gcloud secrets versions access latest \
    --secret="social-engine-${env}-${suffix}" \
    --project="$GCP_PROJECT" 2>/dev/null || echo ""
}

set_vercel_env() {
  local var_name="$1"
  local value="$2"
  local targets="$3"

  if [[ -z "$value" ]]; then
    echo "  SKIP: $var_name (empty value — secret missing in GCP SM)"
    return 1
  fi

  if [[ "$DRY_RUN" == true ]]; then
    echo "  [dry-run] $var_name → $targets (${#value} chars)"
    return 0
  fi

  IFS=',' read -ra target_list <<< "$targets"
  for target in "${target_list[@]}"; do
    target="${target// /}"
    # Remove then add (idempotent)
    vercel env rm "$var_name" "$target" --yes $VERCEL_TOKEN_FLAG 2>/dev/null || true
    echo -n "$value" | vercel env add "$var_name" "$target" $VERCEL_TOKEN_FLAG 2>/dev/null
  done
  echo "  SET: $var_name → $targets"
}

SYNCED=0
SKIPPED=0
ERRORS=0

echo "=== Social Engine → Vercel Env Sync ==="
echo "GCP Project: $GCP_PROJECT"
echo "Sync env:    $SYNC_ENV"
echo "Dry run:     $DRY_RUN"
echo ""

# Static vars (always sync)
echo "--- Static config vars ---"
for var_name in "${!STATIC_VARS[@]}"; do
  if set_vercel_env "$var_name" "${STATIC_VARS[$var_name]}" "production,preview,development"; then
    ((SYNCED++))
  else
    ((ERRORS++))
  fi
done

# GCP SM secrets
echo ""
echo "--- GCP Secret Manager secrets ---"
for mapping in "${ENV_MAPPINGS[@]}"; do
  IFS='|' read -r var_name secret_suffix targets secret_env <<< "$mapping"

  # Skip if not matching the requested env
  if [[ "$SYNC_ENV" != "both" && "$secret_env" != "$SYNC_ENV" ]]; then
    continue
  fi

  value=$(pull_secret "$secret_suffix" "$secret_env")
  if set_vercel_env "$var_name" "$value" "$targets"; then
    ((SYNCED++))
  else
    ((SKIPPED++))
  fi
done

echo ""
echo "=== Summary ==="
echo "  Synced:  $SYNCED"
echo "  Skipped: $SKIPPED"
echo "  Errors:  $ERRORS"

if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "Dry run complete. Re-run without --dry-run to apply."
elif [[ $ERRORS -gt 0 ]]; then
  echo ""
  echo "Completed with errors. Check output above."
  exit 1
else
  echo ""
  echo "Sync complete. Vercel will pick up new env vars on next deploy."
fi

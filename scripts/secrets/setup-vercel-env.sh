#!/usr/bin/env bash
# =============================================================================
# scripts/secrets/setup-vercel-env.sh — Social Engine
# Wire all required env vars into the Vercel project from GCP Secret Manager
#
# Usage:
#   ./scripts/secrets/setup-vercel-env.sh [dev|prod|both]
#
# Prerequisites:
#   - vercel CLI installed and authenticated: vercel login
#   - gcloud CLI authenticated and project set to ffe-cicd
#   - VERCEL_PROJECT_ID set or run from apps/dashboard/
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GCP_PROJECT="ffe-cicd"
VERCEL_ENV_TARGET="${1:-both}"
DASHBOARD_DIR="$REPO_ROOT/apps/dashboard"

# Vercel environment mappings: "vercel-env-name:gcp-env-suffix:vercel-target"
# Format: VAR_NAME|gcp-secret-suffix|vercel-target(s)
declare -a ENV_MAPPINGS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|clerk-publishable-key|preview,development"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|clerk-publishable-key-prod|production"
  "CLERK_SECRET_KEY|clerk-secret-key|preview,development"
  "CLERK_SECRET_KEY|clerk-secret-key-prod|production"
  "CLERK_WEBHOOK_SECRET|clerk-webhook-secret|preview,development"
  "CLERK_WEBHOOK_SECRET|clerk-webhook-secret-prod|production"
  "NEXT_PUBLIC_CONVEX_URL|convex-url|preview,development"
  "NEXT_PUBLIC_CONVEX_URL|convex-url-prod|production"
  "CONVEX_DEPLOYMENT|convex-deployment|preview,development"
  "CONVEX_DEPLOYMENT|convex-deployment-prod|production"
  "ZERNIO_API_KEY|zernio-api-key|preview,development"
  "ZERNIO_API_KEY|zernio-api-key-prod|production"
  "GOOGLE_API_KEY|google-api-key|preview,development,production"
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY|google-maps-api-key|preview,development,production"
  "NEXT_PUBLIC_POSTHOG_KEY|posthog-key|preview,development,production"
  "SENTRY_DSN|sentry-dsn|preview,development,production"
  "STRIPE_SECRET_KEY|stripe-secret-key|preview,development"
  "STRIPE_SECRET_KEY|stripe-secret-key-prod|production"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|stripe-publishable-key|preview,development"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|stripe-publishable-key-prod|production"
  "STRIPE_WEBHOOK_SECRET|stripe-webhook-secret|preview,development,production"
)

# Static (non-secret) vars
declare -A STATIC_VARS=(
  ["NEXT_PUBLIC_CLERK_SIGN_IN_URL"]="/sign-in"
  ["NEXT_PUBLIC_CLERK_SIGN_UP_URL"]="/sign-up"
  ["NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"]="/dashboard"
  ["NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"]="/dashboard"
  ["NEXT_PUBLIC_POSTHOG_HOST"]="https://app.posthog.com"
  ["NEXT_PUBLIC_APP_URL"]="https://social-engine-five.vercel.app"
  ["SENTRY_ORG"]="fireflyevents"
  ["SENTRY_PROJECT"]="social-engine"
  ["NODE_ENV"]="production"
)

pull_secret() {
  local secret_name="$1"
  gcloud secrets versions access latest \
    --secret="social-engine-${secret_name}" \
    --project="$GCP_PROJECT" 2>/dev/null || echo ""
}

set_vercel_env() {
  local var_name="$1"
  local value="$2"
  local targets="$3"  # comma-separated: production,preview,development

  if [[ -z "$value" ]]; then
    echo "  SKIP: $var_name (empty value)"
    return
  fi

  # Remove existing var to avoid conflict
  vercel env rm "$var_name" --yes 2>/dev/null || true

  # Add for each target
  IFS=',' read -ra target_list <<< "$targets"
  for target in "${target_list[@]}"; do
    echo -n "$value" | vercel env add "$var_name" "$target" < /dev/stdin
  done
  echo "  SET: $var_name → $targets"
}

echo "Setting up Vercel env vars for social-engine"
echo "GCP Project: $GCP_PROJECT"
echo "Target: $VERCEL_ENV_TARGET"
echo ""

cd "$DASHBOARD_DIR"

echo "--- Static vars ---"
for var_name in "${!STATIC_VARS[@]}"; do
  set_vercel_env "$var_name" "${STATIC_VARS[$var_name]}" "production,preview,development"
done

echo ""
echo "--- Secrets from GCP SM ---"
for mapping in "${ENV_MAPPINGS[@]}"; do
  IFS='|' read -r var_name secret_suffix targets <<< "$mapping"
  value=$(pull_secret "$secret_suffix")
  set_vercel_env "$var_name" "$value" "$targets"
done

echo ""
echo "Done. Run 'vercel env ls' to verify."
echo ""
echo "IMPORTANT: Trigger a redeploy after setting env vars:"
echo "  vercel --prod   (for production)"
echo "  vercel          (for preview)"

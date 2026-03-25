#!/usr/bin/env bash
# =============================================================================
# scripts/secrets/push-secrets.sh — Social Engine
# Push secrets to GCP Secret Manager (project: ffe-cicd)
# Naming convention: social-engine-{env}-{var-name}
#
# Usage:
#   ./scripts/secrets/push-secrets.sh [dev|prod]
#
# Prerequisites:
#   - gcloud CLI authenticated: gcloud auth login
#   - Project set: gcloud config set project ffe-cicd
#   - .env.local (dev) or .env.production (prod) present in apps/dashboard/
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GCP_PROJECT="ffe-cicd"
ENV="${1:-dev}"

if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

if [[ "$ENV" == "dev" ]]; then
  ENV_FILE="$REPO_ROOT/apps/dashboard/.env.local"
else
  ENV_FILE="$REPO_ROOT/apps/dashboard/.env.production"
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Create it first (copy from .env.example)."
  exit 1
fi

echo "Pushing social-engine $ENV secrets to GCP SM project: $GCP_PROJECT"
echo "Source file: $ENV_FILE"
echo ""

# Map of env var name → GCP SM secret name
declare -A SECRET_MAP=(
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"]="social-engine-${ENV}-clerk-publishable-key"
  ["CLERK_SECRET_KEY"]="social-engine-${ENV}-clerk-secret-key"
  ["CLERK_WEBHOOK_SECRET"]="social-engine-${ENV}-clerk-webhook-secret"
  ["NEXT_PUBLIC_CONVEX_URL"]="social-engine-${ENV}-convex-url"
  ["CONVEX_DEPLOYMENT"]="social-engine-${ENV}-convex-deployment"
  ["ZERNIO_API_KEY"]="social-engine-${ENV}-zernio-api-key"
  ["GOOGLE_API_KEY"]="social-engine-${ENV}-google-api-key"
  ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"]="social-engine-${ENV}-google-maps-api-key"
  ["NEXT_PUBLIC_POSTHOG_KEY"]="social-engine-${ENV}-posthog-key"
  ["SENTRY_DSN"]="social-engine-${ENV}-sentry-dsn"
  ["STRIPE_SECRET_KEY"]="social-engine-${ENV}-stripe-secret-key"
  ["STRIPE_WEBHOOK_SECRET"]="social-engine-${ENV}-stripe-webhook-secret"
  ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]="social-engine-${ENV}-stripe-publishable-key"
)

push_secret() {
  local var_name="$1"
  local secret_name="$2"
  local value

  # Extract value from .env file (ignore comments, handle quoted values)
  value=$(grep -E "^${var_name}=" "$ENV_FILE" | head -1 | sed "s/^${var_name}=//; s/^['\"]//; s/['\"]$//")

  if [[ -z "$value" ]]; then
    echo "  SKIP: $var_name not set in $ENV_FILE"
    return
  fi

  # Create secret if it doesn't exist
  if ! gcloud secrets describe "$secret_name" --project="$GCP_PROJECT" &>/dev/null; then
    echo "  CREATE: $secret_name"
    gcloud secrets create "$secret_name" \
      --project="$GCP_PROJECT" \
      --replication-policy="automatic" \
      --quiet
  fi

  # Add new version
  echo -n "$value" | gcloud secrets versions add "$secret_name" \
    --project="$GCP_PROJECT" \
    --data-file=- \
    --quiet

  echo "  OK: $secret_name"
}

for var_name in "${!SECRET_MAP[@]}"; do
  push_secret "$var_name" "${SECRET_MAP[$var_name]}"
done

echo ""
echo "Done. Verify with: gcloud secrets list --project=$GCP_PROJECT --filter='name:social-engine-${ENV}'"

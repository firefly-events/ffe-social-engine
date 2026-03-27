#!/usr/bin/env bash
# sync-vercel.sh — Sync secrets from GCP Secret Manager to Vercel environment variables.
#
# Usage: ./scripts/sync-vercel.sh <dev|prod>
#
# Prerequisites:
#   - gcloud CLI authenticated (e.g. via WIF in CI)
#   - vercel CLI installed and VERCEL_TOKEN set
#   - VERCEL_ORG_ID and VERCEL_PROJECT_ID set

set -euo pipefail

ENV="${1:-}"
if [[ -z "$ENV" || ! "$ENV" =~ ^(dev|prod)$ ]]; then
  echo "Usage: $0 <dev|prod>" >&2
  exit 1
fi

GCP_PROJECT="${GCP_PROJECT:-ffe-cicd}"

# Map environment to Vercel target
if [[ "$ENV" == "prod" ]]; then
  VERCEL_TARGET="production"
else
  VERCEL_TARGET="preview"
fi

echo "==> Syncing secrets for env=$ENV to Vercel target=$VERCEL_TARGET"

# Helper: read a secret from GCP Secret Manager
gcp_secret() {
  local secret_name="$1"
  gcloud secrets versions access latest --secret="$secret_name" --project="$GCP_PROJECT"
}

# Helper: set a Vercel env var (removes existing, then adds)
# Usage: set_vercel_env <VAR_NAME> <VALUE> <TARGET>
set_vercel_env() {
  local var_name="$1"
  local value="$2"
  local target="$3"

  # Remove existing (ignore errors if it doesn't exist)
  echo "   Setting $var_name for $target"
  vercel env rm "$var_name" "$target" --yes --token="$VERCEL_TOKEN" 2>/dev/null || true
  echo "$value" | vercel env add "$var_name" "$target" --token="$VERCEL_TOKEN"
}

# ── GCP Secret Manager → Vercel env vars ───────────────────────────────────

echo "==> Pulling secrets from GCP Secret Manager (social-engine-${ENV}-*)"

CLERK_PUBLISHABLE_KEY=$(gcp_secret "social-engine-${ENV}-clerk-publishable-key")
CLERK_SECRET_KEY=$(gcp_secret "social-engine-${ENV}-clerk-secret-key")
CONVEX_URL=$(gcp_secret "social-engine-${ENV}-convex-url")
CONVEX_DEPLOYMENT=$(gcp_secret "social-engine-${ENV}-convex-deployment")
CONVEX_DEPLOY_KEY=$(gcp_secret "social-engine-${ENV}-convex-deploy-key")
ZERNIO_API_KEY=$(gcp_secret "social-engine-${ENV}-zernio-api-key")
SENTRY_DSN=$(gcp_secret "social-engine-${ENV}-sentry-dsn")
POSTHOG_KEY=$(gcp_secret "social-engine-${ENV}-posthog-key")
GOOGLE_SERVICE_ACCOUNT_KEY=$(gcp_secret "social-engine-${ENV}-vertex-ai-sa-key")

echo "==> Writing dynamic secrets to Vercel"

set_vercel_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$CLERK_PUBLISHABLE_KEY" "$VERCEL_TARGET"
set_vercel_env "CLERK_SECRET_KEY"                   "$CLERK_SECRET_KEY"      "$VERCEL_TARGET"
set_vercel_env "NEXT_PUBLIC_CONVEX_URL"             "$CONVEX_URL"            "$VERCEL_TARGET"
set_vercel_env "CONVEX_DEPLOYMENT"                  "$CONVEX_DEPLOYMENT"     "$VERCEL_TARGET"
set_vercel_env "CONVEX_DEPLOY_KEY"                  "$CONVEX_DEPLOY_KEY"     "$VERCEL_TARGET"
set_vercel_env "ZERNIO_API_KEY"                     "$ZERNIO_API_KEY"        "$VERCEL_TARGET"
set_vercel_env "SENTRY_DSN"                         "$SENTRY_DSN"            "$VERCEL_TARGET"
set_vercel_env "NEXT_PUBLIC_SENTRY_DSN"             "$SENTRY_DSN"            "$VERCEL_TARGET"
set_vercel_env "NEXT_PUBLIC_POSTHOG_KEY"            "$POSTHOG_KEY"           "$VERCEL_TARGET"
set_vercel_env "GOOGLE_SERVICE_ACCOUNT_KEY"          "$GOOGLE_SERVICE_ACCOUNT_KEY" "$VERCEL_TARGET"

# ── Static env vars ────────────────────────────────────────────────────────

echo "==> Writing static env vars to Vercel"

if [[ "$ENV" == "prod" ]]; then
  set_vercel_env "GOOGLE_CLOUD_PROJECT"              "social-engine-491302"                    "$VERCEL_TARGET"
else
  set_vercel_env "GOOGLE_CLOUD_PROJECT"              "social-engine-dev"                       "$VERCEL_TARGET"
fi
set_vercel_env "NEXT_PUBLIC_POSTHOG_HOST"           "https://us.posthog.com"                  "$VERCEL_TARGET"
set_vercel_env "SENTRY_ORG"                         "firefly-events-inc"                      "$VERCEL_TARGET"
set_vercel_env "SENTRY_PROJECT"                     "social-engine"                           "$VERCEL_TARGET"
set_vercel_env "NEXT_PUBLIC_APP_URL"                "https://social-engine-five.vercel.app"   "$VERCEL_TARGET"
set_vercel_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL"      "/sign-in"                                "$VERCEL_TARGET"
set_vercel_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL"      "/sign-up"                                "$VERCEL_TARGET"

echo "==> Done. All env vars synced for $VERCEL_TARGET."

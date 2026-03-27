#!/usr/bin/env bash
# sync-vercel.sh — Sync secrets from GCP Secret Manager to Vercel env vars
#
# Usage: bash scripts/sync-vercel.sh <environment>
#   environment: "production" (main branch) or "preview" (PRs)
#
# Required env vars:
#   VERCEL_TOKEN       — Vercel API token
#   VERCEL_ORG_ID      — Vercel org/team ID
#   VERCEL_PROJECT_ID  — Vercel project ID
#
# GCP credentials must already be configured before calling this script.

set -euo pipefail

ENVIRONMENT="${1:?Usage: $0 <production|preview>}"

if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "preview" ]]; then
  echo "Error: environment must be 'production' or 'preview', got: $ENVIRONMENT" >&2
  exit 1
fi

# Map deploy environment to GCP secret suffix
if [[ "$ENVIRONMENT" == "production" ]]; then
  ENV="prod"
else
  ENV="dev"
fi

echo "Syncing secrets for environment: $ENVIRONMENT (GCP suffix: $ENV)"

# Helper: read a secret from GCP Secret Manager
gcp_secret() {
  local secret_name="$1"
  gcloud secrets versions access latest --secret="$secret_name" --project=ffe-cicd
}

# Helper: set a Vercel env var (force-overwrites if already set)
vercel_set() {
  local var_name="$1"
  local var_value="$2"
  local env_target="$3"   # production | preview | development
  printf '%s' "$var_value" | vercel env add "$var_name" "$env_target" \
    --token="$VERCEL_TOKEN" \
    --yes \
    --force 2>/dev/null || \
  printf '%s' "$var_value" | vercel env add "$var_name" "$env_target" \
    --token="$VERCEL_TOKEN" \
    --yes
  echo "  Set $var_name ($env_target)"
}

echo "--- Syncing GCP secrets ---"

CLERK_PUB_KEY=$(gcp_secret "social-engine-dev-clerk-publishable-key")
CLERK_SEC_KEY=$(gcp_secret "social-engine-dev-clerk-secret-key")
CONVEX_URL=$(gcp_secret "social-engine-${ENV}-convex-url")
CONVEX_DEPLOYMENT=$(gcp_secret "social-engine-${ENV}-convex-deployment")
CONVEX_DEPLOY_KEY=$(gcp_secret "social-engine-${ENV}-convex-deploy-key")
ZERNIO_API_KEY=$(gcp_secret "social-engine-dev-zernio-api-key")
SENTRY_DSN=$(gcp_secret "social-engine-dev-sentry-dsn")
POSTHOG_KEY=$(gcp_secret "social-engine-dev-posthog-key")

echo "Secrets fetched from GCP Secret Manager."

echo "--- Writing env vars to Vercel ($ENVIRONMENT) ---"

vercel_set "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$CLERK_PUB_KEY"    "$ENVIRONMENT"
vercel_set "CLERK_SECRET_KEY"                   "$CLERK_SEC_KEY"    "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_CONVEX_URL"             "$CONVEX_URL"       "$ENVIRONMENT"
vercel_set "CONVEX_DEPLOYMENT"                  "$CONVEX_DEPLOYMENT" "$ENVIRONMENT"
vercel_set "CONVEX_DEPLOY_KEY"                  "$CONVEX_DEPLOY_KEY" "$ENVIRONMENT"
vercel_set "ZERNIO_API_KEY"                     "$ZERNIO_API_KEY"   "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_SENTRY_DSN"             "$SENTRY_DSN"       "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_POSTHOG_KEY"            "$POSTHOG_KEY"      "$ENVIRONMENT"

echo "--- Writing static env vars to Vercel ($ENVIRONMENT) ---"

vercel_set "NEXT_PUBLIC_POSTHOG_HOST"              "https://us.posthog.com"                           "$ENVIRONMENT"
vercel_set "SENTRY_ORG"                            "firefly-events-inc"                               "$ENVIRONMENT"
vercel_set "SENTRY_PROJECT"                        "social-engine"                                    "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_CLERK_SIGN_IN_URL"         "/sign-in"                                         "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_CLERK_SIGN_UP_URL"         "/sign-up"                                         "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"   "/dashboard"                                       "$ENVIRONMENT"
vercel_set "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"   "/dashboard"                                       "$ENVIRONMENT"
vercel_set "CLERK_JWT_ISSUER_DOMAIN"               "https://regular-ant-26.clerk.accounts.dev"        "$ENVIRONMENT"

echo "Done. All env vars synced to Vercel ($ENVIRONMENT)."

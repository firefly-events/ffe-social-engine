#!/usr/bin/env bash
# =============================================================================
# scripts/sync-vercel.sh — Social Engine
# Syncs all env vars from GCP Secret Manager to Vercel project.
# Wrapper around scripts/secrets/setup-vercel-env.sh for CI use.
#
# Usage:
#   ./scripts/sync-vercel.sh [dev|prod|both]
#
# Called by: .github/workflows/deploy.yml (sync-env job)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/secrets/setup-vercel-env.sh" "${1:-both}"

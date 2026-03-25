# FFE Social Engine — Architecture

## Overview

The Social Engine is an **API-first** SaaS platform for AI-powered social content creation and multi-platform publishing. The API IS the product — the dashboard is one consumer of it. External developers, other FFE apps (Shindig, TTA), and n8n workflows all connect through the same API.

It is NOT bound to Shindig — it serves any Firefly Events product and eventually external customers.

## Core Differentiators (from 40+ tool competitive analysis)

**3 features NO competitor has (verified across 40+ tools):**
1. **Visual n8n-style workflow builder** inside a social platform
2. **Content session branching** (fork, compare, iterate on content)
3. **Analytics → AI generation feedback loop** (engagement data drives content creation)

**Additional competitive edges:**
- Multi-model AI (Gemini + Claude + local models via Tailscale)
- Voice cloning (XTTSv2 on local GPU)
- Full media pipeline: text + image + video + voice in one product
- Replace $229/mo Franken-stack (Jasper+Opus+ElevenLabs+Hootsuite+Zapier) with $29.99/mo
- Closest competitor: Simplified.com (has most features but NO workflow automation, session branching, or analytics loop)

## System Layers

```
                         +-----------------------+
                         |   Other FFE Apps      |
                         | (Shindig, TTA, etc.)  |
                         +----------+------------+
                                    |
                           Social Engine API
                        (scheduling, posting, analytics)
                                    |
+------------------------------------------------------------------+
|                                                                  |
|   EDGE LAYER — Vercel                                            |
|   +---------------------------------------------------------+    |
|   | Next.js Dashboard (SSR + Client)                        |    |
|   |   - User-facing UI (content creation, scheduling, etc.) |    |
|   +---------------------------------------------------------+    |
|   | Vercel Server Actions / API Routes                      |    |
|   |   - Lightweight API calls (Zernio direct posting)       |    |
|   |   - CDN interactions (image/video optimization)         |    |
|   |   - Edge service calls (low-latency, small payloads)    |    |
|   |   - Auth middleware (Clerk)                             |    |
|   |   - Proxy to GCP backend for heavy operations           |    |
|   +---------------------------------------------------------+    |
|                                                                  |
+------------------------------------------------------------------+
         |                    |                    |
         v                    v                    v
+----------------+   +----------------+   +------------------+
| Convex         |   | Zernio API     |   | GCP Backend      |
| (Database)     |   | (Social Posts) |   | (Heavy Compute)  |
+----------------+   +----------------+   +------------------+
| - User data    |   | - 14 platforms |   | n8n Workflows    |
| - Profiles     |   | - OAuth proxy  |   |  - Post sched.   |
| - Content      |   | - Token mgmt   |   |  - Batch ops     |
| - Scheduling   |   | - Media upload |   |  - Retries       |
| - Analytics    |   +----------------+   |  - Webhooks      |
| - Real-time    |                        |                  |
| - Clerk sync   |                        | Node.js Services |
+----------------+                        |  - AI pipelines  |
                                          |  - Heavy media   |
                                          |  - Bulk exports  |
                                          +--------+---------+
                                                   |
                                             Tailscale VPN
                                                   |
                                          +--------+---------+
                                          | Hive (Local HW)  |
                                          | Mac Studio M4 Max|
                                          |  - Voice gen     |
                                          |  - Visual gen    |
                                          |  - GPU inference  |
                                          |  - Qdrant + RAG  |
                                          +------------------+
```

## Layer Responsibilities

### 1. Vercel Edge Layer (Front-End Server)

The Vercel deployment is more than just the Next.js dashboard — it acts as the front-end server for the entire platform.

**Server Actions / API Routes handle:**
- **Direct Zernio calls** — simple post-now actions that don't need n8n orchestration
- **CDN interactions** — image/video optimization, thumbnail generation, asset caching
- **Edge service calls** — low-latency operations that benefit from Vercel's edge network
- **Payload reduction** — aggregate/filter data before sending to client (keep bundles small)
- **Auth gate** — Clerk middleware validates all requests before they hit backend services
- **Cross-product API** — exposes endpoints that Shindig, TTA, and other FFE apps consume

**When to use Vercel vs GCP:**
| Use Vercel Server Actions | Use GCP/n8n |
|--------------------------|-------------|
| Single Zernio post (fire-and-forget) | Scheduled post queues |
| CDN asset optimization | Bulk media processing |
| User profile CRUD | Multi-step workflows |
| Real-time Convex queries | Retry/dead-letter handling |
| Edge-cached responses | GPU-bound AI generation |
| < 10s execution time | Long-running jobs |

### 2. Convex (Database + Real-Time)

Convex is the primary data layer. Chosen because it auto-binds to both Vercel and Clerk, eliminating manual webhook wiring.

**Stores:**
- User profiles (synced from Clerk automatically)
- Zernio Profile IDs (per-user, maps to their connected social accounts)
- Content drafts, templates, scheduled posts
- Analytics data, engagement metrics
- Subscription/billing state (via Clerk Billing)

**Convex HTTP Actions** call out to:
- GCP-hosted n8n for complex workflows
- Tailscale-tunneled services for GPU tasks
- Zernio API for social account management

**Cross-product:** Shared Convex project potential with TTA/game-library (same stack).

### 3. Zernio (Social Posting API)

Headless API for multi-platform social publishing. Manages OAuth tokens for all connected social accounts — we never touch the refresh loop.

**We store:**
- One API key (vaulted in GCP SM: `social-engine-dev-zernio-api-key`)
- Per-user Zernio Profile IDs in Convex

**We don't store:**
- OAuth tokens for social platforms (Zernio handles this)
- Platform-specific API credentials

**Integration paths:**
- **Direct via Vercel Server Actions** — simple post-now, account linking
- **Via n8n workflows** — scheduled posts, bulk operations, retry logic (uses `n8n-nodes-zernio`)

### 4. GCP Backend (Heavy Compute + n8n)

GCP hosts services that need persistent compute, long execution times, or orchestration.

**n8n Workflows:**
- Post scheduling and queue management
- Multi-platform dispatch with retry/dead-letter
- Webhook receivers (Zernio callbacks, Clerk events, payment events)
- Batch operations (bulk post, bulk analytics pull)
- Cross-product integrations (Shindig events → social posts)

**Node.js Services:**
- AI content pipelines (text generation, content optimization)
- Heavy media processing (video composition, audio sync)
- Bulk data exports and analytics aggregation
- Any operation exceeding Vercel's 10s/60s function limits

### 5. Hive via Tailscale (Local Hardware)

Mac Studio M4 Max accessed via Tailscale VPN for GPU-bound workloads.

**Services:**
- Voice generation (XTTSv2 / local TTS models)
- Visual generation (image/video AI models)
- Qdrant vector DB (RAG context for AI content)
- Ollama (local LLM inference, embeddings)

**Access pattern:** GCP services → Tailscale tunnel → Hive local ports

## Cross-Product API

The Social Engine exposes an API (via Vercel Server Actions + GCP endpoints) that other FFE applications consume:

```
Shindig (mobile)  ──┐
                    ├──→ Social Engine API ──→ Zernio / n8n / Convex
TTA (game-library) ─┤
                    │    Endpoints:
Website            ─┤    - POST /api/social/post     (create post)
                    │    - GET  /api/social/schedule  (view queue)
Future products    ─┘    - POST /api/social/connect   (link accounts)
                         - GET  /api/social/analytics  (engagement data)
```

This means social features are built ONCE in the engine and consumed by all products — no per-app social integration.

## Auth Flow

```
User → Clerk (sign-in) → Convex (user auto-synced)
                       → Zernio (Profile created on first social connect)
                       → All API calls carry Clerk session token
```

Clerk handles auth for the dashboard AND for cross-product API calls (Shindig etc. authenticate against Clerk, get a token, call Social Engine API).

## Environment & Secrets

| Secret | Location | Purpose |
|--------|----------|---------|
| `ZERNIO_API_KEY` | GCP SM + `.env.local` | Social posting API |
| `CLERK_SECRET_KEY` | GCP SM + `.env.local` | Auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env.local` | Client-side auth |
| Convex deploy key | Convex dashboard | DB access |
| GCP service account | GCP IAM | n8n + service hosting |
| Tailscale auth key | Tailscale admin | VPN tunnel to hive |

All secrets vaulted in GCP Secret Manager (project: `ffe-cicd`). Naming: `social-engine-{env}-{var-name}`.

## Current State (2026-03-24)

- [x] Clerk auth setup (PR #34 by Gemini)
- [x] Zernio API key vaulted
- [ ] Convex project setup (replace MongoDB)
- [ ] Zernio integration (profile creation, posting)
- [ ] n8n deployment on GCP
- [ ] Tailscale tunnel to hive
- [ ] Cross-product API endpoints
- [ ] Vercel server actions for edge operations

## Deployment

### Vercel Deployment (apps/dashboard)
The Vercel configuration is defined in `apps/dashboard/vercel.json`.

**Environment Variables Required in Vercel Dashboard:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk client-side key
- `CLERK_SECRET_KEY`: Clerk secret key
- `CONVEX_DEPLOYMENT`: Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL`: Convex public URL
- `ZERNIO_API_KEY`: Zernio API Key
- `STRIPE_SECRET_KEY`: Stripe API Key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

### GCP + WIF Setup
The infrastructure on GCP requires Workload Identity Federation (WIF) for secure deployments.

**Setup WIF:**
1. Create a GCP WIF Pool for GitHub Actions.
2. Bind GitHub repository `firefly-events/ffe-social-engine` to the WIF Pool.
3. Create a Service Account for WIF to impersonate (e.g., `social-engine-deployer@ffe-cicd.iam.gserviceaccount.com`).
4. Grant the Service Account necessary roles: `roles/run.admin`, `roles/artifactregistry.writer`, `roles/iam.serviceAccountUser`.

### n8n Deployment
We deploy n8n to **Cloud Run** or **GCE** using Docker Compose.
- GCE is preferred if persistent volumes for n8n local files are needed without setting up Cloud SQL/Cloud Storage for Cloud Run.
- **Docker Compose Setup**: `docker/n8n/docker-compose.yml` configures n8n, redis, and potentially postgres.

### Tailscale Setup
To connect to the local GPU hardware (Hive Mac Studio):
1. Install Tailscale on the n8n GCP deployment instances (either as a sidecar container in Cloud Run, or natively on GCE).
2. Generate an ephemeral, reusable Auth Key from the Tailscale admin console.
3. Ensure the GCP deployment nodes can resolve Hive's Tailnet IP or MagicDNS hostname.
4. Set the `TAILSCALE_AUTH_KEY` in the deployment environment.

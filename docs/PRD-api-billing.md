# PRD: API Billing & Rate Limiting

**Status:** Draft
**Author:** AI Agent (FIR-1289)
**Date:** 2026-03-27
**Ticket:** FIR-1289

---

## Overview

Social Engine ships API access on the Free tier — a deliberate differentiator versus every major competitor that gates API behind enterprise plans (see FIR-1185). This PRD defines how API keys are issued, how rate limits are enforced per plan tier, how API usage counts against the shared credit pool, and how overages are handled gracefully rather than with an instant wall.

---

## Problem Statement

1. **No API billing layer exists today.** The n8n integration (FIR-1269) and MCP server assume unlimited access. Once external developers use the API, unmetered access will destroy margins.
2. **Flat request limits don't reflect cost.** A developer running 100 Flash-Lite caption requests has a very different cost profile than one running 100 Veo 3 Standard video generations. Rate limits must be layered on top of credits, not replace them.
3. **Instant hard blocks create bad developer experience.** Developers who hit a rate limit with no warning abandon the product. A soft-warn → throttle → block progression is standard practice and retains more users.

---

## Goals / Non-Goals

### Goals
- Issue per-user API keys via Clerk, tied to their plan tier.
- Enforce both requests-per-minute (RPM) rate limits and monthly credit limits per tier.
- Count API usage against the same credit pool as dashboard usage (no separate API credit bucket).
- Implement soft-warn (80%) → throttle (95%) → block (100%) overage progression.
- Make API usage visible in both the Social Engine dashboard and Clerk's key management UI.
- Support key rotation and revocation.
- Emit a webhook event on overage threshold crossings.

### Non-Goals
- Separate API-only credit packs in V1 (credits are shared with dashboard usage).
- Per-endpoint rate limits in V1 (single per-key RPM limit per plan).
- GraphQL API (REST only in V1).
- SDK generation — API consumers use OpenAPI spec directly.

---

## User Stories

1. **As a developer on the Free tier**, I want an API key that works up to 10 req/min, so I can prototype integrations without upgrading.
2. **As a Pro user**, I want my API usage to count against my existing 50 credits/month, so I understand the full budget in one place.
3. **As an Agency user building n8n workflows**, I want 500 req/min so my batch jobs complete in reasonable time.
4. **As any API user**, I want to receive a warning response header when I am at 80% credit consumption, so I can adjust my usage before hitting a block.
5. **As an API user whose key is compromised**, I want to revoke it and issue a new key immediately without losing my plan features.
6. **As an admin**, I want a webhook fired when any user crosses the 95% credit threshold, so I can proactively reach out before they churn.

---

## Technical Design

### Rate Limit Tiers

| Plan | Requests / Minute | Credits / Month |
|------|------------------|----------------|
| Free | 10 | 5 |
| Starter | 30 | 10 |
| Pro | 100 | 50 |
| Agency | 500 | 200 |
| Enterprise | Custom (admin-set) | Custom |

RPM limits apply per API key. If a user has multiple keys, each key has its own RPM window (not shared). Monthly credits are shared across all keys and dashboard usage for that user.

### API Key Management via Clerk

Clerk provides native API key management under the `@clerk/backend` SDK. Keys are scoped to a user and carry a metadata payload that includes the user's plan tier.

```typescript
// Creating a key (triggered on plan purchase or user request)
const key = await clerkClient.users.createApiKey(userId, {
  name: "Default API Key",
  metadata: {
    planId: "pro",
    rpmLimit: 100,
  },
});
```

Keys are displayed in the Social Engine dashboard under Settings → API Keys. Clerk's dashboard also shows key last-used timestamps.

**Key format**: `se_live_XXXXXXXXXXXXXXXXXXXX` (32 random chars, prefixed to avoid confusion with other API keys).

### Middleware: `checkApiKeyTier()`

All API requests under `/api/v1/` pass through this middleware before hitting route handlers.

```typescript
// apps/api/src/middleware/apiKeyAuth.ts

export async function checkApiKeyTier(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKey = req.headers["x-api-key"] as string;
  if (!apiKey) return res.status(401).json({ error: "Missing API key" });

  // 1. Validate key with Clerk
  const keyData = await clerkClient.apiKeys.verify(apiKey);
  if (!keyData) return res.status(401).json({ error: "Invalid API key" });

  const { userId, metadata } = keyData;
  const { planId, rpmLimit } = metadata;

  // 2. Check RPM rate limit (sliding window)
  const rpmResult = await checkRateLimit(apiKey, rpmLimit);
  if (!rpmResult.allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfterMs: rpmResult.retryAfterMs,
    });
  }

  // 3. Attach to request context for downstream credit checks
  req.apiContext = { userId, planId, rpmLimit, keyId: keyData.id };
  next();
}
```

Credit checking (balance check + deduction) is handled by the shared credit middleware called after `checkApiKeyTier()`. API requests go through the same `checkBalance → reserveCredits → execute → confirm/refund` flow defined in PRD-credit-system.md.

### Rate Limiting Implementation: Sliding Window

A sliding window algorithm provides smoother rate limiting than fixed windows (avoids the double-burst problem at window boundaries).

**V1 implementation**: Convex mutations with a `rateLimitWindows` table:

```typescript
rateLimitWindows: defineTable({
  keyId: v.string(),       // Clerk API key ID
  windowStart: v.number(), // Unix ms of window open
  requestCount: v.number(),
})
  .index("by_key_window", ["keyId", "windowStart"]),
```

On each request, the middleware atomically:
1. Queries requests in the last 60 seconds for this key.
2. If count >= rpmLimit → reject with 429.
3. Else insert a new request timestamp row.

Rows older than 60 seconds are cleaned up lazily.

**V2 consideration**: If Convex write latency proves too high for RPM enforcement on Agency (500 req/min), migrate rate limit state to Upstash Redis (globally distributed, sub-millisecond). The interface (`checkRateLimit(keyId, limit)`) is abstracted so the backing store is swappable.

### Overage Handling Flow

Credits are shared with dashboard usage. The overage progression applies to the combined credit consumption:

```
0% - 79%   → Normal operation. No warnings.
80% - 94%  → Soft warn. API responses include header:
               X-Credits-Warning: 0.82 (ratio used)
               X-Credits-Remaining: 9
             Dashboard shows amber banner.
95% - 99%  → Throttle. RPM limit reduced to 20% of plan limit.
               API responses include header:
               X-Credits-Warning: 0.96
               Retry-After: 30  (artificial delay injected)
             Dashboard shows red banner + upgrade CTA.
100%       → Block. All AI generation endpoints return 402.
               Non-AI endpoints (scheduling, analytics reads) continue to work.
             Dashboard shows "Credits exhausted" modal.
```

The 20% RPM throttle at 95% is implemented by temporarily overriding the key's `rpmLimit` metadata in the rate limit check.

### Response Headers on All API Requests

```
X-Credits-Allocated: 50
X-Credits-Used: 41
X-Credits-Remaining: 9
X-Credits-Reset: 1746057600   (Unix timestamp of next period start)
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 67
X-RateLimit-Reset: 1743029460 (Unix timestamp of current RPM window reset)
```

These headers are present on every response, making it easy for API consumers to implement client-side adaptive throttling.

### Key Rotation and Revocation

**Rotation**: Creating a new key does not immediately revoke the old key. The old key remains valid for a 24-hour grace period (configurable) to allow in-flight integrations to update. After the grace period, the old key is automatically revoked.

**Immediate revocation**: User can force-revoke a key instantly (for compromised key scenarios). The Clerk key is invalidated immediately. All in-flight requests with that key that have already passed middleware will complete, but the next request will return 401.

**Dashboard UI**:
- Keys table: name, created, last used, status (active / rotating / revoked), plan tier.
- "Rotate" button: creates a new key in rotating state, shows both keys with grace period countdown.
- "Revoke" button: immediately invalidates with confirmation modal.

### Webhook for Overage Events

When a user crosses an overage threshold, a webhook is fired to a configurable endpoint (set per user in settings, or globally for admin alerting):

```json
POST {webhookUrl}
{
  "event": "credits.threshold_crossed",
  "userId": "user_abc123",
  "planId": "pro",
  "threshold": 0.80,
  "creditsUsed": 41,
  "creditsAllocated": 50,
  "periodEnd": 1746057600,
  "timestamp": 1743000000
}
```

Threshold events fired: `0.80`, `0.95`, `1.00` (exhausted).

Webhooks are delivered with HMAC-SHA256 signatures (secret set in user settings) and retried up to 3 times with exponential backoff.

---

## Implementation Plan

### Phase 1 — Key Issuance (Week 1)
- Enable Clerk API key feature for the Social Engine organization.
- Auto-create a default key on plan activation (Free tier and above).
- Add API Keys section to dashboard Settings page (list, rotate, revoke).

### Phase 2 — Rate Limiting (Week 2)
- Implement `checkApiKeyTier()` middleware.
- Implement sliding window rate limiter in Convex (`rateLimitWindows` table).
- Add all credit/rate-limit response headers.
- Wire overage progression logic (soft warn / throttle / block).

### Phase 3 — Webhooks & Observability (Week 3)
- Implement overage webhook delivery with HMAC signing and retry logic.
- Add API usage tab to dashboard: chart of requests/day, credits used via API vs. dashboard.
- Add API usage to `GET /api/admin/usage` response (see PRD-super-admin-dashboard.md).

### Phase 4 — Redis Migration (if needed, post-launch)
- Profile Convex write latency under Agency-tier load (500 req/min).
- Migrate rate limit state to Upstash Redis if p99 latency > 50ms.

---

## Acceptance Criteria

- [ ] A new Pro user has an API key created automatically; key is visible in Settings → API Keys.
- [ ] A request with no API key returns HTTP 401 with `{ "error": "Missing API key" }`.
- [ ] A request with an invalid/revoked key returns HTTP 401.
- [ ] A Free-tier key is rejected with HTTP 429 after the 11th request within a 60-second window.
- [ ] A Pro-tier key allows 100 requests in a 60-second window without rejection.
- [ ] All API responses include the `X-Credits-*` and `X-RateLimit-*` headers.
- [ ] At 80% credit usage, API responses include `X-Credits-Warning` header and the dashboard shows an amber banner.
- [ ] At 95% credit usage, the effective RPM is reduced to 20% of plan limit.
- [ ] At 100% credit usage, AI generation endpoints return HTTP 402; non-AI endpoints continue to respond.
- [ ] Revoking a key instantly invalidates it; the next request with that key returns 401.
- [ ] Key rotation creates a new active key and puts the old key in a 24-hour grace period.
- [ ] Overage webhook fires within 30 seconds of threshold crossing, with correct HMAC signature.
- [ ] API usage appears in the admin usage analytics endpoint.

---

## Open Questions

1. **Multiple keys per user**: Should Pro users be allowed multiple named keys (e.g., "production", "staging")? Each key has its own RPM window but shares the monthly credit pool. Currently assuming 1 key for Free/Starter, 3 keys for Pro, 10 keys for Agency — needs product sign-off.
2. **Upstash Redis**: Budget and ops overhead of adding Upstash to the stack. Should we start with Convex and only migrate if needed, or pre-provision Upstash to avoid a future migration?
3. **MCP server rate limits**: The Agency+ MCP server (FIR-1185) has `Priority 10K/min` access per the pricing doc. Does this apply to the same key or a separate MCP-specific key?
4. **Free-tier API key auto-creation**: Auto-creating a key on Free signup adds key management overhead. Alternative: create the key only when the user visits Settings → API Keys for the first time.
5. **Webhook secret rotation**: How do users rotate their webhook signing secret without disrupting their integration?

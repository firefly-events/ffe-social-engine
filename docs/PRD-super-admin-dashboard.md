# PRD: Super Admin Dashboard

**Status:** Draft
**Author:** AI Agent (FIR-1289)
**Date:** 2026-03-27
**Ticket:** FIR-1289

---

## Overview

Social Engine needs an operational control plane that lets authorized FFE staff adjust pricing parameters, credit allocations, model weights, and feature availability without code deployments. This PRD defines the admin dashboard — initially a thin V1 that delegates to existing tooling, then a full custom UI in V2.

---

## Problem Statement

1. **Zero-deploy config changes are not possible today.** Changing a credit weight or disabling an expensive model requires a code change, PR review, and deployment — too slow when responding to provider cost spikes or incidents.
2. **Clerk dashboard lacks numeric controls.** Clerk manages plan membership and feature flags well but has no native UI for editing numeric credit allocations or model cost weights.
3. **No visibility into cross-user usage.** There is currently no aggregate view of how credits are being consumed across the user base — required for margin monitoring and abuse detection.

---

## Goals / Non-Goals

### Goals
- V1: Use Clerk's built-in org/user management for plan feature flags; use Convex environment config for numeric limits. Zero custom UI needed.
- V2: Deliver a custom `/admin` route in the dashboard with full CRUD over credit allocations, model weights, feature toggles, and per-user overrides.
- All admin actions must be logged (who changed what, when, old value, new value).
- Admin access must be restricted to users with the Clerk `admin` organization role.

### Non-Goals
- Self-serve admin access for Agency/Enterprise customers (that is a separate "team owner" role).
- Financial reporting or Stripe reconciliation (handled in Stripe Dashboard).
- Content moderation tooling.

---

## User Stories

1. **As an FFE admin**, I want to change the credit weight of "Veo 3 Standard" from 5 to 7 without a deployment, so I can respond immediately to a GCP price increase.
2. **As an FFE admin**, I want to kill-switch a specific model across all users, so I can disable it within seconds if it starts producing errors or costs spiral.
3. **As an FFE admin**, I want to see total credits consumed per plan tier this month, so I can verify margins are on target.
4. **As an FFE admin**, I want to increase a specific user's credit allocation by 50 for the current period, so I can resolve a support ticket without modifying their plan.
5. **As an FFE admin**, I want to see a changelog of all config changes, so I can audit who changed what and roll back if needed.

---

## Technical Design

### V1 Approach (Ship with MVP)

V1 delegates to existing tooling to avoid building custom admin UI before the product has usage data to inform what controls matter most.

| Control Type | V1 Tool |
|-------------|---------|
| Plan membership & feature flags | Clerk Dashboard (metadata) |
| Credit allocations per plan | Convex environment variables (`PLAN_CREDITS_FREE`, `PLAN_CREDITS_PRO`, etc.) |
| Model credit weights | Convex `adminConfig` table, edited via Convex Dashboard |
| Feature kill switches | Convex `adminConfig` table, edited via Convex Dashboard |
| Per-user credit override | Convex Dashboard — direct row edit on `usageCounters` |
| Usage analytics | Convex Dashboard query runner |

This means V1 admin operations require access to Clerk and Convex dashboards — acceptable for an internal team, not acceptable for a scaled product.

### V2 Custom Admin Dashboard

#### Route Structure

```
/admin                      → redirect to /admin/config
/admin/config               → plan allocations + model weights
/admin/features             → feature toggles + kill switches
/admin/usage                → aggregate usage analytics
/admin/users                → per-user search + credit override
/admin/audit                → admin action changelog
```

Access guard: middleware checks Clerk session for `org:admin` role. Any request without this role returns 403.

### Data Model

#### Convex `adminConfig` Table

```typescript
// convex/schema.ts
adminConfig: defineTable({
  key: v.string(),          // unique config key
  value: v.any(),           // typed by key (see below)
  updatedAt: v.number(),    // Unix ms
  updatedBy: v.string(),    // Clerk user ID of last editor
})
  .index("by_key", ["key"]),
```

**Config key schema:**

```typescript
// key: "planAllocations"
{
  free: 5,
  starter: 10,
  pro: 50,
  agency: 200,
  enterprise: 500,   // default; individual overrides set on usageCounters row
}

// key: "operationCosts"
{
  text:  { "gemini-flash-lite": 1, "gemini-pro": 3 },
  image: { "imagen-basic": 1, "imagen-3": 3, "imagen-3-ultra": 5 },
  video: { "hailuo-fast": 1, "veo-3-1": 3, "veo-3-standard": 5 },
  voice: { "xtts-v2": 1, "elevenlabs-hd": 3 },
}

// key: "featureToggles"
{
  videoGeneration: true,
  voiceCloning: true,
  imageGeneration: true,
  automationPipelines: true,
}

// key: "killSwitches"
{
  "veo-3-standard": false,    // false = disabled/killed
  "elevenlabs-hd": true,
}
```

#### Convex `adminAuditLog` Table

```typescript
adminAuditLog: defineTable({
  adminUserId: v.string(),
  action: v.string(),           // "update_config" | "override_user_credits" | etc.
  configKey: v.optional(v.string()),
  targetUserId: v.optional(v.string()),
  oldValue: v.any(),
  newValue: v.any(),
  createdAt: v.number(),
})
  .index("by_created", ["createdAt"])
  .index("by_admin", ["adminUserId", "createdAt"]),
```

### API Endpoints

All admin endpoints are Next.js route handlers under `/api/admin/`. All require a valid Clerk session with `org:admin` role, enforced by shared middleware.

#### GET /api/admin/config

Returns the full `adminConfig` store as a JSON object.

```
Response 200:
{
  "planAllocations": { "free": 5, "pro": 50, ... },
  "operationCosts": { "text": { ... }, ... },
  "featureToggles": { "videoGeneration": true, ... },
  "killSwitches": { "veo-3-standard": true, ... }
}
```

#### PUT /api/admin/config

Replaces one config key atomically.

```
Body: { "key": "operationCosts", "value": { ... } }
Response 200: { "ok": true, "updatedAt": 1743000000000 }
```

Writes an `adminAuditLog` row before returning.

#### GET /api/admin/usage

Returns aggregated credit usage for the current period across all users, broken down by plan tier and category.

```
Query params: ?period=current|previous&groupBy=plan|category|day
Response 200:
{
  "period": { "start": ..., "end": ... },
  "totalCreditsIssued": 45000,
  "totalCreditsUsed": 12400,
  "byPlan": {
    "pro":    { "users": 120, "creditsIssued": 6000, "creditsUsed": 3200 },
    "agency": { "users": 15,  "creditsIssued": 3000, "creditsUsed": 1100 }
  },
  "byCategory": { "text": 4200, "image": 3800, "video": 2900, "voice": 1500 }
}
```

This endpoint aggregates from `usageCounters` — no separate analytics store needed in V1.

#### GET /api/admin/users/:userId

Returns current period usage and plan for a specific user.

#### POST /api/admin/users/:userId/override-credits

Sets a one-time credit addition for the user's current period.

```
Body: { "additionalCredits": 50, "reason": "Support ticket #1234" }
Response 200: { "ok": true, "newBalance": 73 }
```

Logs to `adminAuditLog` with `action: "override_user_credits"`.

### UI — V2 Admin Dashboard

#### Config Editor (`/admin/config`)

- Table layout: rows are individual model/plan combinations, columns are the editable value plus metadata (last changed, changed by).
- Inline edit: click a cell → text input appears → Tab to confirm → row highlight shows unsaved state.
- Save button: commits all dirty cells in a single PUT request.
- Revert button: discards all unsaved changes and reloads from server.
- Kill switch column: toggle switch per model. Red = killed (disabled for all users regardless of plan).

#### Feature Toggles (`/admin/features`)

- Simple boolean toggle list with labels, descriptions, and last-changed metadata.
- Toggling a feature off shows a confirmation modal: "This will immediately prevent all users from accessing [feature]. Confirm?"

#### Usage Analytics (`/admin/usage`)

- Period selector (current month / last month / custom range).
- Summary cards: total credits issued, total used, utilization %.
- Bar chart: credits used by category (text / image / video / voice).
- Table: per-plan breakdown with user counts and credit utilization.
- Export to CSV button.

#### User Override (`/admin/users`)

- Search by email or user ID.
- User card shows: plan, current period credits (used / allocated), last 10 operations.
- "Add credits" action: numeric input + required reason field.
- All overrides visible in the audit log.

### Admin Auth

Auth is enforced via Clerk's organization roles:

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { orgRole } = await auth();
    if (orgRole !== "org:admin") {
      return new Response("Forbidden", { status: 403 });
    }
  }
});
```

Admin users are assigned the `org:admin` role in the Clerk dashboard. No separate admin user table is needed.

---

## Implementation Plan

### Phase 1 — V1 Config Foundation (Week 1, alongside credit system)
- Create `adminConfig` table in Convex schema.
- Seed default `planAllocations`, `operationCosts`, `featureToggles`, `killSwitches` rows.
- Credit system reads costs from `adminConfig` (no hardcoded values).
- Create `adminAuditLog` table.

### Phase 2 — V2 API Layer (Week 3)
- Implement admin middleware (Clerk `org:admin` check).
- Implement `GET/PUT /api/admin/config`.
- Implement `GET /api/admin/usage`.
- Implement `GET/POST /api/admin/users/:userId`.

### Phase 3 — V2 UI (Week 4-5)
- Config editor table with inline edit and kill switches.
- Feature toggle list.
- Usage analytics charts.
- User search and credit override.
- Audit log table.

---

## Acceptance Criteria

- [ ] Changing a model's credit weight in the admin config takes effect on the next generation request without a code deploy.
- [ ] Killing a model via `killSwitches` causes all generation requests for that model to return a clear "model unavailable" error within 1 request cycle.
- [ ] The usage analytics endpoint returns accurate aggregate data matching the sum of `usageCounters` rows for the period.
- [ ] A non-admin user accessing any `/admin` route receives HTTP 403.
- [ ] Every config change writes an `adminAuditLog` row with old value, new value, and the admin's user ID.
- [ ] A user credit override is reflected in the user's dashboard credit counter within 5 seconds.
- [ ] The audit log is read-only (no delete or edit endpoint exists).
- [ ] V1 config (Convex env variables) is replaced by `adminConfig` table reads before V2 UI ships — there is one source of truth.

---

## Open Questions

1. **Who gets admin access at launch?** Define the initial Clerk org with admin roles for FFE staff before go-live.
2. **Audit log retention policy**: 13 months (matching `usageCounters`)? Indefinite? Legal/compliance input needed.
3. **Rate limiting on admin API**: Should admin endpoints be rate-limited separately to prevent accidental loop writes?
4. **V2 UI timeline**: V2 is gated on V1 credit system being stable. Estimate V2 start at Week 4 of credit system rollout.
5. **Read-only admin role**: Should there be a read-only `org:admin_viewer` role for support staff who need usage visibility but should not change config?

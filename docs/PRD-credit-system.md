# PRD: Credit-Based Usage System

**Status:** Draft
**Author:** AI Agent (FIR-1289)
**Date:** 2026-03-27
**Ticket:** FIR-1289

---

## Overview

Social Engine currently expresses usage limits as flat per-resource counts (e.g., "500 captions/mo", "25 videos/mo"). This creates two problems: the limits are hard to reason about when AI models vary wildly in cost, and there is no clean way to let users mix high-cost and low-cost operations within a single plan budget.

This PRD replaces flat per-resource limits with a **weighted credit system**. Each plan purchases a monthly credit bucket. Each AI operation costs a number of credits proportional to its actual compute cost. Users can spend their credits on any combination of operations — a Starter user who only runs text captions gets 10 operations; one who only runs premium video generation gets 2 operations; most users land somewhere in between.

Credits are unitless from the user's perspective ("you have 50 credits") but map precisely to cost tiers on the back end.

---

## Problem Statement

1. **Model-cost mismatch.** Charging "1 video = 1 video" regardless of whether the user ran Hailuo Fast ($0.002) or Veo 3 Standard ($0.30) destroys margin on premium model usage.
2. **Rigid limits frustrate power users.** A user who has used all their "25 video" slots but has consumed almost no caption budget has no recourse — they hit a wall even though headroom exists in the plan.
3. **No future-proof lever.** When new models are added, a flat-count schema requires a schema migration and a pricing-page update. A credit weight is a one-row config change.

---

## Goals / Non-Goals

### Goals
- Replace all per-resource flat counters with a single credit bucket per user per billing period.
- Assign per-operation credit costs via a configurable lookup table (not hardcoded).
- Display real-time remaining credits in the dashboard.
- Enforce credits before executing any AI operation (check → deduct → execute → log).
- Reset credits automatically at the start of each billing cycle.
- Ship V1 with plain credits — no gamification, no cross-product currency.

### Non-Goals
- "Fireflies" cross-product loyalty currency — deferred to V2 (see Open Questions).
- Credits are not purchasable as add-ons in V1 (evaluate in V2 alongside overage handling).
- Credits are not transferable between users or accounts in V1.
- Rollover of unused credits — credits expire at period end.

---

## User Stories

1. **As a Pro user**, I want to see how many credits I have remaining this month, so I can decide whether to run a premium video or save credits for lighter tasks.
2. **As a Starter user**, I want to understand why an operation was blocked, so I know what to upgrade rather than seeing a generic error.
3. **As an Agency user**, I want to be able to run a mix of text, image, and video operations without hitting separate sub-limits, so I can serve my clients flexibly.
4. **As a dashboard viewer**, I want a real-time credit counter on every generation screen, so I am never surprised by a failed generation.
5. **As an admin**, I want to change the credit cost of an operation without a code deployment, so I can respond to model price changes quickly.

---

## Technical Design

### Credit Tier Table

| Plan | Credits/mo | Cheap model (1 cr) | Mid model (3 cr) | Premium model (5 cr) |
|------|------------|-------------------|-----------------|---------------------|
| Free | 5 | 5 ops | 1 op | 1 op |
| Starter | 10 | 10 ops | 3 ops | 2 ops |
| Pro | 50 | 50 ops | 16 ops | 10 ops |
| Agency | 200 | 200 ops | 66 ops | 40 ops |
| Enterprise | Custom (admin-set) | — | — | — |

### Model Tiers and Credit Weights

| Category | Model / Quality Tier | Credits |
|----------|---------------------|---------|
| **Video** | Hailuo Fast | 1 |
| **Video** | Veo 3.1 | 3 |
| **Video** | Veo 3 Standard | 5 |
| **Image** | Basic (Imagen lite) | 1 |
| **Image** | Mid (Imagen 3) | 3 |
| **Image** | Premium (Imagen 3 Ultra) | 5 |
| **Voice** | Standard (XTTSv2 self-hosted) | 1 |
| **Voice** | HD (ElevenLabs / hosted) | 3 |
| **Text** | Flash-Lite (Gemini Flash-Lite) | 1 |
| **Text** | Pro (Gemini Pro) | 3 |

All weights are stored in the `operationCosts` admin config table (see PRD-super-admin-dashboard.md) and are not hardcoded in application logic.

### Data Model

#### Convex `usageCounters` Table

```typescript
// convex/schema.ts
usageCounters: defineTable({
  userId: v.string(),               // Clerk user ID
  periodStart: v.number(),          // Unix ms — billing cycle start
  periodEnd: v.number(),            // Unix ms — billing cycle end (exclusive)
  planId: v.string(),               // "free" | "starter" | "pro" | "agency" | "enterprise"
  creditAllocation: v.number(),     // Total credits for this period
  creditsUsed: v.number(),          // Running total deducted this period
  creditsByCategory: v.object({
    text: v.number(),
    image: v.number(),
    video: v.number(),
    voice: v.number(),
  }),
  lastUpdatedAt: v.number(),        // Unix ms
})
  .index("by_user_period", ["userId", "periodStart"])
  .index("by_user_active", ["userId", "periodEnd"]),
```

`creditsUsed` is the authoritative running total. `creditsByCategory` is informational (for analytics and the dashboard breakdown display) and is derived from the operation log — it does not gate access independently.

#### Convex `creditTransactions` Table (audit log)

```typescript
creditTransactions: defineTable({
  userId: v.string(),
  periodStart: v.number(),
  operationId: v.string(),          // UUID per generation request
  operationType: v.string(),        // "text" | "image" | "video" | "voice"
  modelId: v.string(),              // e.g., "veo-3-standard"
  creditsCharged: v.number(),
  byoKey: v.boolean(),              // true = BYO key used, no credits deducted
  createdAt: v.number(),
})
  .index("by_user_period", ["userId", "periodStart"])
  .index("by_operation", ["operationId"]),
```

### Credit Deduction Flow

```
User requests generation
        │
        ▼
1. checkBalance(userId)
   → query usageCounters where userId = X and periodEnd > now()
   → compute available = creditAllocation - creditsUsed
   → if available < operationCost → return 402 "Insufficient credits"
        │
        ▼
2. reserveCredits(userId, operationCost)
   → atomic increment creditsUsed + operationCost
   → write pending creditTransaction (status: "reserved")
        │
        ▼
3. executeOperation(params)
   → call AI provider
        │
   ┌────┴────┐
   ▼         ▼
 success   failure
   │         │
   ▼         ▼
4a. confirmTransaction    4b. releaseCredits
    (status: "confirmed")      → decrement creditsUsed by operationCost
                               → update transaction status: "refunded"
```

Step 2 uses an optimistic write with a Convex mutation that atomically checks and increments to prevent race conditions. If the operation fails (step 4b), credits are returned — users are not charged for provider errors.

### Per-Operation Credit Cost Lookup

Credit costs are resolved at runtime via a Convex query:

```typescript
// convex/credits.ts
export const getOperationCost = query({
  args: { operationType: v.string(), modelId: v.string() },
  handler: async (ctx, { operationType, modelId }) => {
    const config = await ctx.db
      .query("adminConfig")
      .filter(q => q.eq(q.field("key"), "operationCosts"))
      .unique();
    return config?.value?.[operationType]?.[modelId] ?? 1; // default 1 credit
  },
});
```

This means credit weights are zero-deploy configurable by admins (see PRD-super-admin-dashboard.md).

### Monthly Reset Mechanism

Credits reset at the start of each billing cycle, which is tied to the user's Stripe subscription `current_period_start`. The reset is triggered by:

1. **Stripe webhook** `invoice.payment_succeeded` → Convex HTTP action creates a new `usageCounters` row for the new period.
2. **Lazy creation fallback**: if a user makes a request and no active counter exists (e.g., webhook was missed), the middleware creates one by querying Stripe for the current period boundaries.

Old `usageCounters` rows are retained for 13 months for analytics, then archived.

### Real-Time Usage Display

The dashboard fetches credit state via a Convex live query (`useQuery`) bound to the active `usageCounters` row. This gives real-time reactivity without polling:

```typescript
const usage = useQuery(api.credits.getActiveUsage, { userId: clerkUserId });
// { creditAllocation: 50, creditsUsed: 23, byCategory: { text: 12, image: 8, video: 3, voice: 0 } }
```

The dashboard header shows: **"27 of 50 credits remaining"**

Each generation screen shows the cost of the operation before the user clicks "Generate": **"This will use 3 credits (16 remaining after)"**

### "Fireflies" Cross-Product Currency — V2 Evaluation

The concept of a shared "Fireflies" loyalty currency across Social Engine, Shindig, and future FFE products is architecturally interesting but out of scope for V1 for these reasons:

- Requires a cross-product identity layer that doesn't exist yet (FIR-48 was cancelled).
- Credit-to-Firefly conversion rates introduce pricing complexity that could undermine the simplicity of the credit model.
- Tax and accounting treatment of loyalty points adds legal overhead.

**Recommendation:** Ship V1 with plain integer credits. Add a `currencyType` field to `usageCounters` in the schema now (defaulting to `"credits"`) so a future migration to a unified currency is a config change, not a schema rewrite. Revisit Fireflies as a standalone initiative after Social Engine reaches $10K MRR.

---

## Implementation Plan

### Phase 1 — Foundation (Week 1)
- Define Convex schema: `usageCounters`, `creditTransactions`.
- Implement `checkBalance`, `reserveCredits`, `confirmTransaction`, `releaseCredits` mutations.
- Wire Stripe webhook `invoice.payment_succeeded` to period-reset logic.
- Seed `adminConfig.operationCosts` with default weights from the model tier table above.

### Phase 2 — Enforcement (Week 2)
- Add credit check middleware to all AI generation endpoints.
- Implement lazy counter creation fallback.
- Connect dashboard live query for the credit counter in the header.
- Add per-screen "This will use N credits" cost preview.

### Phase 3 — Analytics & Polish (Week 3)
- Category breakdown chart in dashboard (text / image / video / voice).
- Usage history table (last 30 operations with credit cost).
- Email notification at 80% credit consumption.
- Acceptance testing against all plan tiers.

---

## Acceptance Criteria

- [ ] A Pro user starting a fresh billing period has exactly 50 credits available.
- [ ] Running a Veo 3 Standard generation deducts exactly 5 credits; balance shows 45.
- [ ] Running a Flash-Lite caption deducts exactly 1 credit.
- [ ] If a user has 2 credits remaining and requests a 3-credit operation, the request is rejected with HTTP 402 and a descriptive error message.
- [ ] If the AI provider returns an error, the reserved credits are fully refunded within 5 seconds.
- [ ] On the day of billing cycle renewal, credits reset to plan allocation within 60 seconds of the Stripe webhook.
- [ ] The dashboard credit counter updates in real time without a page reload.
- [ ] Each generation screen displays the credit cost before the user submits.
- [ ] Changing a model's credit weight in `adminConfig` takes effect on the next request without a code deploy.
- [ ] `creditTransactions` audit log contains a complete, immutable record of every deduction and refund.
- [ ] BYO key operations (see PRD-byo-provider-keys.md) write a `byoKey: true` transaction log entry and do NOT decrement credits.

---

## Open Questions

1. **Credit add-on packs**: Should users be able to purchase additional credits mid-cycle (e.g., 50 credits for $9.99)? Leaning yes for V2 — needs Stripe metered billing integration.
2. **Rollover credits**: Should unused credits carry forward (capped at 1 period)? Adds complexity but improves user perception. Deferred to V2.
3. **Free tier credit floor**: 5 credits/mo may be too low for developer evaluation. Consider 10 credits for Free to improve activation rate.
4. **Enterprise credit allocation**: Currently "custom / admin-set". Define the default for new Enterprise accounts in the admin config.
5. **Fireflies timeline**: When does Social Engine reach the MRR threshold to justify the cross-product currency work?

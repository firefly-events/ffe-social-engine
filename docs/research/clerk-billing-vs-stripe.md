# Clerk Billing vs Stripe Direct — Decision

> Research 2026-03-24. Verified against Clerk docs (beta status confirmed).
> **UPDATED 2026-03-24:** Decision reversed. Clerk Billing for v1, Stripe direct for v2.

## DECISION: Clerk Billing for v1. Migrate to Stripe when metered billing is needed.

### Hard Blockers in Clerk Billing

| Requirement | Clerk Billing | Stripe Direct |
|-------------|--------------|---------------|
| Metered billing (Agency overages) | **NO — absent entirely** | Yes (Meters API) |
| Per-provider add-on charges ($2/mo per platform) | **NO — no add-on model** | Yes (subscription items) |
| Dynamic pricing via API (super admin) | **NO — no API found** | Yes (full CRUD) |
| Production-ready | **NO — explicit beta, breaking changes** | Yes |
| Data in Stripe dashboard | **NO — parallel system, doesn't sync** | Yes (native) |
| Tax/VAT | **NO** | Yes (Stripe Tax) |
| Additional fee | **0.7% of billing volume** on top of Stripe's 2.9%+$0.30 | 2.9% + $0.30 only |

### What Clerk Billing CAN do (but it's not enough)
- Multiple subscription tiers (6 tiers = fine)
- Monthly + annual billing
- Plan upgrades (immediate) / downgrades (end of cycle)
- JWT-encoded entitlements (`auth.has({ plan: 'starter' })`)
- Webhook events for subscription lifecycle

### The Cost Problem
At Agency tier ($299/mo), Clerk Billing adds $2.09/customer/month in fees for zero benefit over Stripe direct.

### Correct Architecture
```
Clerk → Auth only (session, JWT, user management)
Stripe → All billing (subscriptions, metered, add-ons, entitlements)
MongoDB → stripeCustomerId linked to Clerk userId
Super Admin → Built against Stripe API (CRUD products/prices/coupons)
```

**Glue code needed:** ~300 lines. Webhook handler + customer creation helper + MongoDB field. One-time implementation, trivially outweighed by Stripe's capabilities.

### When Clerk Billing Makes Sense
Simple 2-tier SaaS (free + pro), flat-rate monthly, no add-ons, no metered billing, no super admin. That is not this product.

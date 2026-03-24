# Aggregator Pricing — FINAL (Verified 2026-03-24)

> Verified directly from zernio.com/pricing and ayrshare.com/pricing/

## DECISION: Zernio. Not even close.

## Zernio Pricing (Annual Billing)

| Plan | Monthly (Annual) | Social Sets | Posts/mo | API Calls/day |
|------|-----------------|-------------|----------|---------------|
| Free | $0 | 2 | 20 | N/A |
| Build | $16/mo ($192/yr) | 10 | 120 | 50 |
| Accelerate | $41/mo ($492/yr) | 50/unit (stackable to 1,000) | Unlimited | 500 |
| Unlimited | $833/mo ($9,996/yr) | Unlimited | Unlimited | Unlimited |

**1 Social Set = 1 user/brand that connects once to each of 14 platforms.**

### Accelerate Stacking (Linear at $41/unit/mo annual)

| Social Sets | Units | Base/mo | +Analytics ($50/unit) | +DMs ($50/unit) | All-In/mo |
|-------------|-------|---------|----------------------|-----------------|-----------|
| 50 | 1 | $41 | $91 | $141 | **$141** |
| 100 | 2 | $82 | $182 | $282 | **$282** |
| 200 | 4 | $164 | $364 | $564 | **$564** |
| 500 | 10 | $410 | $910 | $1,410 | **$1,410** |
| 1,000 | 20 | $820 | $1,820 | $2,820 | **$2,820** |

### Per-User Unit Economics (at 50+ users)

| Feature | Cost/User/Month |
|---------|----------------|
| Posting only | $0.82 |
| + Analytics | $1.82 |
| + Analytics + DMs | $2.82 |

### Add-ons

| Add-on | Build | Accelerate | Unlimited |
|--------|-------|------------|-----------|
| Analytics | +$10/mo | +$50/unit/mo | +$1,000/mo |
| Comments + DMs | +$10/mo | +$50/unit/mo | +$1,000/mo |

## Ayrshare Pricing (For Reference — NOT Recommended)

| Tier | Monthly | Profiles |
|------|---------|----------|
| Premium | $149/mo | 1 |
| Launch | $299/mo | 10 |
| Business | $599/mo | 30 (+$8.99/extra) |

**At 50 users: Zernio = $141/mo all-in. Ayrshare = $599 + overages = ~$779/mo.** Zernio is 5.5x cheaper.

## Our Margin Analysis (Updated Pricing Direction)

| Our Tier | Price | Zernio Cost/User | Gross Margin |
|----------|-------|-----------------|-------------|
| Free | $0 | $0 (export only) | N/A |
| Starter | $9.99 | $0 (export only) | 100% |
| Basic | $14.99 | $0.82 (posting) | 95% |
| Pro | $29.99 | $1.82 (posting+analytics) | 94% |
| Business | $300 | $2.82 (all-in) | 99% |
| Enterprise | $750+ / Talk to Us | $2.82 (all-in) | 99.6% |

**Break-even to cover Zernio base ($141/mo all-in): 5 Pro users or 1 Business user.**

## Market Undercutting

| Competitor | Their Price | Our Equivalent | Savings |
|------------|------------|----------------|---------|
| Hootsuite | $99-249/seat/mo | Pro $29.99/mo | 70-88% cheaper |
| Sprout Social | $199-399/seat/mo | Pro $29.99/mo | 85-92% cheaper |
| Sprinklr | $299+/seat/mo | Business $300/mo (but with AI gen) | Same price, 10x more features |
| Buffer | $6/channel/mo (~$36 for 6) | Basic $14.99/mo | 58% cheaper + AI gen |
| Jasper | $39-69/mo (no posting) | Pro $29.99/mo (with posting) | Cheaper AND does more |

## Open Questions for Zernio
1. Can we create/delete Social Sets per user via API programmatically?
2. Are analytics add-ons per-unit or per-account?
3. Post limit enforcement — do we gate in our layer or can Zernio enforce?
4. OAuth flow — can end users connect their own platforms through our UI?

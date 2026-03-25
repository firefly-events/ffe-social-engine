# FIR-1185: Hormozi Pricing Restructure — Final Tier Structure

> Decision made 2026-03-25. Implements Hormozi $100M Offers framework: fewer tiers, obvious middle, overpriced premium.

## The Problem with 6 Tiers

The old structure (Free → Starter $9.99 → Basic $14.99 → Pro $29.99 → Business $300 → Enterprise $750+) had two fatal flaws:
1. **Too many low-end tiers** — Starter and Basic are $5 apart, creating analysis paralysis
2. **10x price cliff** — jumping from Pro ($29.99) to Business ($300) with no middle option caused churn at Pro

## New 4-Tier Structure (Hormozi Model)

| Tier | Monthly | Annual | Role |
|------|---------|--------|------|
| **Free** | $0 | — | Lead gen + developer hook (API on free) |
| **Pro** | $29.99 | $23.99/mo ($287.88/yr) | **THE OBVIOUS BUY** |
| **Agency** | $99 | $82/mo ($984/yr) | Team/multi-tenant bridge |
| **Enterprise** | $499+ | Custom | Aspirational — overpriced by design |

## Why This Works (Hormozi Logic)

### Pro is the obvious buy
- **$29.99 replaces $229/mo Franken-stack** (Jasper + ElevenLabs + Hootsuite + ChatGPT + Zapier)
- Voice cloning at $29.99 is unprecedented — Lately.ai charges $199+ for voice model
- Multi-platform posting at $29.99 undercuts Buffer ($18), Later ($33), SocialBee ($40)
- Anyone doing the math picks Pro without hesitation

### Agency bridges the 10x cliff
- Old gap: $29.99 → $300 (10x jump) = 0% conversion
- New gap: $29.99 → $99 (3.3x) = reasonable upgrade path for growing teams
- Multi-tenant + white-label at $99 vs Hootsuite ($249) = still 2.5x cheaper

### Enterprise is deliberately overpriced
- $499+ is aspirational — buyers who can afford it don't care about the price
- Creates "Pro feels like a steal" effect by comparison
- High ACVs ($5,988+/yr) fund enterprise support costs

## Feature-to-Tier Mapping

| Feature | Free | Pro | Agency | Enterprise |
|---------|------|-----|--------|------------|
| AI Captions | 5/mo | 500/mo | Unlimited | Unlimited |
| AI Videos | 1/mo | 25/mo | 250/mo | Unlimited |
| Direct Posts | Export only | 100/mo | Unlimited | Unlimited |
| Platforms | — | 5 | All 14+ | All + custom |
| Voice Clones | — | 5 | 50 | Unlimited |
| Workflow Builder | — | ✓ | ✓ | ✓ |
| Analytics | — | ✓ | ✓ | ✓ |
| White-label | — | — | ✓ | ✓ |
| Multi-tenant seats | — | — | 5 seats | Unlimited |
| API Access | 100 req/day | Full | Full + MCP | Priority 10K/min |
| Custom SLA | — | — | — | ✓ |
| SSO / SAML | — | — | — | ✓ |

## Margin Analysis

| Tier | Price | Avg Monthly Cost | Gross Margin |
|------|-------|-----------------|--------------|
| Free | $0 | $0.15 | N/A |
| Pro | $29.99 | $12.00 | **60%** |
| Agency | $99 | $28.00 | **72%** |
| Enterprise | $499+ | $120.00 | **76%+** |

Source: `docs/research/pricing-charge-sheet-cost-analysis.md`

## API Differentiator — Kill Shot

**Every competitor gates API behind enterprise plans:**
- Hootsuite: $10K+/yr for API access
- Buffer: Deprecated their public API
- Sprout Social: Enterprise only
- We ship API on the **Free tier** (100 req/day) and scale with every tier

This makes us the default social media layer for:
- Developers building automations
- Agencies using n8n / Zapier / Make
- AI agents running agentic workflows (MCP server on Agency+)

## What Was Removed

- **Starter ($9.99)** — eliminated. Export-only users go Free → Pro directly.
- **Basic ($14.99)** — eliminated. $5 above Starter caused choice paralysis.
- **Business ($300)** — replaced by Agency ($99) + Enterprise ($499+).

The "missing middle" at $99 is the key unlock. Old funnel conversion from Pro to anything was near zero because of the 10x cliff.

## Pricing Page Implementation

Updated at `apps/dashboard/src/app/(marketing)/pricing/page.tsx`:
- 4-tier grid (was 6-tier)
- Pro highlighted as "Most Popular"
- Annual billing: Pro saves $72/yr, Agency saves $204/yr
- Comparison table updated for 4 tiers
- CTA copy emphasizes the "$229/mo stack replacement" value prop

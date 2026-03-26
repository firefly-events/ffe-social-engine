# Social Engine Pricing Strategy Research — 2026-03-26

## Vercel AI SDK Pricing
- **Zero cost** — pure client library, no markup from Vercel
- @ai-sdk/google calls Google directly, @ai-sdk/anthropic calls Anthropic directly
- Streaming costs same as non-streaming
- AI Gateway: $5 free/month, then provider list price pass-through

## Gemini Model Pricing (per 1M tokens)
| Model | Input | Output | Notes |
|---|---|---|---|
| 3.1 Pro Preview | $2.00 | $12.00 | Deep thinking, Opus+ equivalent |
| 3 Flash Preview | $0.30 | $2.50 | Standard, Sonnet equivalent |
| 3.1 Flash-Lite Preview | $0.10 | $0.40 | Cheap, Haiku equivalent |
| 3.1 Flash (image gen) | TBD | TBD | "Nano Banana 2" — native image generation |

## Video Generation (Veo)
| Model | Per Second | 10-sec clip |
|---|---|---|
| Veo 2 | $0.35/sec | $3.50 |
| Veo 3 Fast | $0.15/sec | $1.50 |
| Veo 3.1 Standard | $0.40/sec | $4.00 |

## Clerk Billing
- Same cost as Stripe (no extra fee)
- Plans managed in Clerk dashboard
- `<PricingTable />` component for rendering
- `has({ plan, feature })` for gating
- Beta — pin SDK versions

## Cost Per Free User
- ~$0.001-0.005/month on Flash-Lite at 10K tokens
- 10,000 free users = $10-50/month — absorb it

## Competitor Tier Analysis
| Tool | Tiers | Free? | Low-End | Mid | High |
|---|---|---|---|---|---|
| Buffer | 3 | Yes (3 ch) | $5/ch | $10/ch | — |
| Canva | 4 | Yes | $15 | $20/seat | Custom |
| Descript | 3-4 | Yes | $12 | $24 | $40 |
| OpusClip | 4 | Yes | $15 | $29 | Custom |
| Jasper AI | 3 | No (trial) | $39 | $59 | Custom |
| Hootsuite | 2 paid | No | $99 | $249 | Custom |

## Recommended Pricing Structure

### Free = Trial (NOT a pricing tier)
Free sits ABOVE the paid tiers as a trial/teaser:
- "Try for free" — 5 captions, 1 video, export only
- Converts to paid after trial or stays limited forever
- Separate from the 4 paid tiers on the pricing page

### 4 Paid Tiers
| | Starter | Pro (obvious buy) | Business | Enterprise |
|---|---|---|---|---|
| Monthly | ~$12-15 | $29.99 | $99 | $499+ |
| Annual/mo | ~$10-12 | $23.99 | $79 | Custom |
| Captions | 50/mo | 500/mo | 2000/mo | Unlimited |
| Videos | 5/mo | 25/mo | 100/mo | Unlimited |
| Posts | Export only | 100/mo | 500/mo | Unlimited |
| Platforms | 2 | 5 | All 14 | All + custom |
| Voice clones | 0 | 5 | 20 | Unlimited |
| API | Basic (100/day) | Full | Full + MCP | Priority |
| Seats | 1 | 1 | 5 (+$15/seat) | Unlimited |
| Analytics | Basic | Full | Full | Full |
| Workflows | — | Yes | Yes | Yes |

### Key Pricing Psychology
- Default toggle to ANNUAL (lower number first)
- Pro = "replaces $229/mo stack" (anchor against competitor costs)
- Business at $99 is correct — raise to $149 when sub-accounts ship
- "Most Popular" badge on Pro

## Pre-Launch vs Post-Launch

### Must exist at launch
- AI caption generation (Free trial + Starter + Pro)
- Direct posting to 2+ platforms (Pro+)
- Basic analytics (Pro+)
- Billing enforcement
- API key issuance (Starter+)

### Post-launch additions
- Video generation (4-8 weeks)
- Sub-accounts (6-10 weeks)
- White-label (8-12 weeks)
- Workflow automation (8-12 weeks)

## Pricing Experiments
- Van Westendorp survey on pricing page for first 500 visitors (PostHog)
- A/B test upgrade flow with PostHog Experiments post-launch
- Lock pricing at launch, stable for 12 months
- Founding member grandfathering: 24 months at launch price

## Sub-Accounts / Agency Model
- Launch: Workspace model (shared account, sub-brands)
- V2: True sub-accounts (client logins, privacy)
- V3: API passthrough / reseller (Enterprise)

## Super Admin Control
- DB-driven plan config (zero-deploy price changes)
- PostHog flags for A/B experiments
- Admin UI at /admin/pricing

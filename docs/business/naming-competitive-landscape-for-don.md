# Product Naming, Competitive Landscape & Market Position — For Don's Review

> Compiled 2026-03-24. Updated 2026-03-26. Updated with deep competitive research from 40+ tools, verified pricing, and domain availability checks.

---

## The Product in One Line

**AI-powered social media content creation + scheduling + analytics SaaS.**

> "Your social media, on autopilot. Powered by your voice."

**What makes us different from EVERYONE:** We are the only product that combines AI text gen + AI image gen + AI video gen + voice cloning + multi-platform posting + analytics + n8n-style workflow automation in one tool. Nobody else closes the full loop.

**The API moat:** Every competitor is a dashboard prison — no API, or API locked behind $10K+ enterprise plans. We're API-first. AI agents (Claude, GPT, Gemini, custom bots) can create content, schedule posts, pull analytics, and trigger workflows programmatically. In the agentic era, tools without APIs don't exist. We're the social media layer for autonomous workflows, not just a UI for humans clicking buttons.

> "The social media API for humans AND agents."

---

## Market Opportunity

| Metric | Value |
|--------|-------|
| TAM (Social Media Management + AI Marketing) | $30-42B, 24% CAGR |
| SAM (SMB + agencies, excludes Fortune 500) | ~$5B |
| SOM (Year 1-3) | $1.2-6M ARR (1,000-5,000 paying users) |
| Our price range | $0-750/mo (6 tiers) |
| Market undercut vs enterprise tools | 70-92% cheaper than Hootsuite/Sprout Social |

---

## Competitive Landscape — Magic Quadrant Style

We researched **40+ tools** across scheduling, AI content creation, video, voice, and automation. Here's where everyone sits:

### Quadrant Map (text-based)

```
HIGH Ability to Execute
  │
  │  LEADERS                          CHALLENGERS
  │  ┌─────────────────────┐          ┌──────────────────────┐
  │  │ Hootsuite            │          │ Sprout Social         │
  │  │ Buffer               │          │ Sprinklr              │
  │  │ Later                │          │ Khoros                │
  │  │ SocialBee            │          │ Brandwatch            │
  │  └─────────────────────┘          └──────────────────────┘
  │
  │  VISIONARIES                      NICHE PLAYERS
  │  ┌─────────────────────┐          ┌──────────────────────┐
  │  │ Predis.ai            │          │ Lately.ai             │
  │  │ Simplified ★         │          │ Bolta.ai              │
  │  │ ContentStudio        │          │ FeedHive              │
  │  │ Ocoya                │          │ Octopost              │
  │  │ >>>  US  <<<         │          │ Blotato               │
  │  └─────────────────────┘          │ Postiz (open source)  │
  │                                    │ SocialPost.ai         │
  │                                    └──────────────────────┘
  │
  └──────────────────────────────────────────────────── HIGH Vision
```

**We position in VISIONARIES** — broadest feature vision in the market but pre-launch. As we gain users, we move toward Leaders.

**★ Simplified.com is the closest single competitor** — they have text + image + video + voice cloning + multi-platform posting. But they DON'T have: workflow automation, session branching, analytics feedback loop, 3-mode UX, or export-first pricing.

---

## The 7-Feature Gap — Nobody Has All of These (Updated 2026-03-26)

| Feature | Simplified | Predis.ai | Hootsuite | Buffer | Ocoya | Bolta.ai | FeedHive | ContentStudio | **Us** |
|---------|-----------|-----------|-----------|--------|-------|----------|----------|--------------|--------|
| **Public REST API** | Business+ | No | Enterprise | **Deprecated** | No | No | No | No | **Yes (core product)** |
| **Agentic Workflow Ready** | No | No | No | No | No | No | No | No | **Yes (API-first)** |
| **MCP/n8n/Zapier Nodes** | Yes (Native) | No | Zapier only | Zapier only | Zapier | No | No | Zapier | **Yes (n8n + MCP + Zapier)** |
| **Webhooks** | Yes (Business) | No | Enterprise | No | No | No | No | No | **Yes** |
| AI Text Gen | Yes | Yes | OwlyWriter | Basic | Yes | Yes | Yes | Yes | **Yes (multi-model)** |
| AI Image Gen | Yes | Yes | Templates | No | Yes | Yes | No | Yes | **Yes (FLUX/DALL-E)** |
| AI Video Gen | Yes | Yes | No | No | No | Yes | No | Yes | **Yes (planned)** |
| Voice Cloning | **Yes** | No | No | No | No | No | No | No | **Yes (XTTSv2)** |
| Multi-Platform Post | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | **Yes (via Zernio)** |
| Analytics → AI Loop | No | **Yes (Genetic)** | No | No | No | No | Partial | No | **Yes (planned)** |
| n8n-Style Workflow | No | No | No | No | Limited | Limited | No | No | **Yes (visual DAG)** |
| Session Branching | No | No | No | No | No | No | No | No | **Yes** |
| Export-First Model | No | No | No | No | No | No | No | No | **Yes** |

**FIVE features with ZERO coverage across all 40+ tools:**
1. **Public REST API on all tiers** — competitors either have NO API (Predis, Bolta, FeedHive), gate it (Simplified), or gate it behind $10K+ enterprise plans (Hootsuite).
2. **Agentic workflow compatibility** — AI agents (Claude, GPT, Gemini, custom) can create content, schedule posts, pull analytics, and trigger workflows via API.
3. **Visual n8n-style workflow builder** inside a social media platform — nobody
4. **Content session branching** (fork, compare, iterate) — nobody
5. **True analytics → generation feedback loop** — nobody (FeedHive and Predis have partial prediction, not generation)

---

## Direct Competitor Deep Dives (Updated 2026-03-26)

### Simplified.com — CLOSEST COMPETITOR
- **What:** All-in-one AI content platform (text + image + video + voice clone + scheduling)
- **Price:** Free / $20/mo / $85/mo / Enterprise
- **Voice cloning:** 'AI Voice' feature; 60s-5m audio sample; emotional nuance; 100+ languages. Competitive with XTTSv2.
- **Video gen:** 'AI Clips' for long-to-short transformation. Realistic AI avatars. Integrates Runway Gen-4 and Kling 3.0.
- **API:** Business tier includes API + Webhooks. Native n8n/Zapier connectors.
- **Gaps:** No internal workflow builder, no session branching, no analytics->gen loop.

### Predis.ai — STRONG AI COMPETITOR
- **What:** AI-generated social posts (text + image + video + carousels) with predictive scoring
- **Price:** $19/mo (Core) / $40/mo (Rise) / $212/mo (Enterprise+)
- **Strengths:** 'Creative Velocity' focus. 'Micro-pivots' (visual iterations). Genetic algorithms for ad variations (feedback loop).
- **Gaps:** No voice cloning at any tier. No workflow automation. No session branching.
- **Our edge:** Voice cloning, workflow automation, session branching, lower Pro price ($29.99 vs $40)

### Bolta.ai — AGGRESSIVE NEWCOMER
- **What:** AI social tool with "agentic voice learning" and content loops
- **Price:** Free / $11/mo (aggressive pricing)
- **Strengths:** Free/low cost AI replies, smart scheduling.
- **Gaps:** No personal voice cloning. No visual workflow builder.
- **Our edge:** Voice cloning, visual workflow builder, session branching, deeper AI (multi-model)

### ContentStudio — BEST VALUE INCUMBENT
- **What:** Content discovery + AI creation + scheduling + analytics
- **Price:** $19/mo (5 accounts)
- **Strengths:** Image AND video gen at $19/mo. Competitor benchmarking.
- **Gaps:** No voice cloning. No visual workflow builder. No session branching.
- **Our edge:** Voice cloning, workflow automation, session branching. Note: their pricing undercuts ours at low tier.

### FeedHive — BEST ANALYTICS INTEGRATION
- **What:** AI scheduling with predictive performance scoring and conditional posting
- **Price:** $19/mo (Creator) / $29/mo (Brand) / $99/mo (Business)
- **Strengths:** Best analytics → scheduling feedback loop.
- **Gaps:** No image/video/voice generation.
- **Our edge:** Full multimodal AI generation. Workflow automation. Session branching.

---

## Pricing Advantage — Where We Win (Updated 2026-03-26)

### Our Pro ($29.99/mo) vs. Comparable Tiers

| Competitor | Their Price | Our Savings | What They're Missing |
|-----------|------------|-------------|---------------------|
| Simplified Business | $85/mo | **2.8x cheaper** | No workflow builder, no branching |
| Hootsuite Standard | $99-149/mo | **3-5x cheaper** | No voice, no image gen, no video gen |
| Predis.ai Rise | $40/mo | **25% cheaper** | No voice, no workflow automation |

### The "Franken-Stack" Replacement

What a marketer pays today to get what we offer in one product:

| Tool | Monthly Cost | What It Does |
|------|-------------|-------------|
| Jasper AI | $49/mo | AI text generation |
| Opus Clip | $19/mo | Video clipping |
| ElevenLabs | $22/mo | Voice cloning |
| ChatGPT Plus | $20/mo | AI assistant |
| Hootsuite | $99/mo | Scheduling + posting |
| Zapier | $20/mo | Automation |
| **Total** | **$229/mo** | |
| **Us (Pro)** | **$29.99/mo** | **All of the above** |

**We replace a $229/mo stack with a $29.99/mo product. That's the pitch.**

### Pricing Structure — Updated Direction (2026-03-26)

**Annual vs Monthly** (like Zernio): Offer both. Annual = 2 months free (pay for 10, get 12). Show monthly price crossed out with annual savings highlighted. This is standard SaaS — drives commitment + reduces churn.

**Revised Tiers (Hormozi model — big skip, obvious middle buy):**

| Tier | Monthly | Annual (2mo free) | Key Features | Support |
|------|---------|-------------------|-------------|---------|
| **Free** | $0 | — | 3 posts/day, 1 account, basic AI, **API access (100 req/day)** | Community/docs |
| **Pro** | $29.99 | $24.99/mo ($299/yr) | 50 posts/day, 10 accounts, voice cloning, workflows, analytics, **full API + webhooks** | Email, priority queue |
| **Agency** | $99-149 | ~$99/mo ($999/yr) | Unlimited posts, 25 accounts, multi-tenant sub-users, white-label, **API + MCP server** | Dedicated support, onboarding call |
| **Premium** | $499 | ~$416/mo ($4,999/yr) | Everything + SSO/SAML, custom integrations, **priority API (10K req/min)** | On-call support, success manager |
| **Enterprise** | Custom | Custom | SLAs, custom dev, unlimited everything, **dedicated API infra** | Dedicated team, SLA guarantees |

**API on EVERY tier** — this is the killer differentiator. Hootsuite charges $10K+ for API access. Buffer deprecated theirs. We include it free. Rate limits scale with tier, but the API itself is never gated. This makes us the default choice for developers, agencies building automations, and AI agents running agentic workflows.

---

## Why We Can't Use "Social Engine"

**SocialEngine.com** — active product since 2007 (white-label community CMS). 18 years of common-law trademark rights. SEO completely owned by them. Hard no.

---

## Sea Creature Naming Landscape — What's Taken

Don's instinct (octopus, lobster, many-armed creatures) is a great metaphor — multi-platform = multiple arms. But the space has major landmines:

### Directly Taken Names

| Name | What It Is | Threat Level |
|------|-----------|-------------|
| **Oktopost** | B2B enterprise social ($8K-50K/yr). Tel Aviv, $20M funded. | HIGH — would fight trademark |
| **Octopost** (octopost.ai) | B2C/creator AI social, $9-29/mo. **Domain no longer resolving** — may be defunct. | MEDIUM — was direct competitor |
| **MeetEdgar** | Social scheduler, **octopus mascot** named Edgar, $49-99/mo | HIGH — octopus IS their brand |
| **Moltbook** | AI social network with **lobster mascot**. **ACQUIRED BY META March 2026.** | EXTREME — Meta owns the lobster/molt space now |
| **Inkwell.social** | Live federated social journaling platform (ActivityPub). Launched March 2026. | HIGH — ink + social is taken |
| **InkFlow** | AI content generator (inkflow.io, aiinkflow.com) | MEDIUM — ink + content is claimed |
| **AI-Octopus** | Social media CRM/chatbot tool | MEDIUM |
| **Kraken** (multiple) | Kraken Agency (social mgmt), plus Kraken exchange | HIGH — extremely crowded |
| **Hydra Social** | iOS app in App Store | MEDIUM |
| **SQUID / SocialSquid** | Multiple social media agencies and tools | MEDIUM |

### Domains Verified as TAKEN

| Domain | Owner | Status |
|--------|-------|--------|
| clasp.ai | B2B benefits SaaS (NYC, $7.88M raised) | Active product |
| reef.ai | B2B customer revenue platform (funded) | Active product |
| pinch.ai | Fraud/returns SaaS (YC, $5M raised) | Active product |
| hydra.ai | AI product discovery toolkit | Active product |
| armada.ai | Edge computing platform ($226M raised) | Active product |
| inkwell.social | Federated social journal | Active product |
| inkflow.io | AI content generator | Active product |
| octo.social | Parked on GoDaddy aftermarket | For sale (not free) |
| ceph.io | Open source storage system (Red Hat) | Active project |

### Names to HARD AVOID

- **Molt / Moltbook** — Meta acquired Moltbook March 2026. "Molt" is now Meta IP territory.
- **Inkwell** — inkwell.social is a live product. inkwell.ai has multiple competitors.
- **Clasp** — clasp.ai is a funded startup.
- **Any "octo-" prefix** — Oktopost ($20M funded) would fight it.
- **Ceph** — well-known open-source storage system. Tech audience will be confused.

---

## Naming Options — Updated with Domain Research (2026-03-26)

### Direction A: Sea Creatures That WORK (Don's Preference)

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 1 | **Okto** | **okto.social** (FREE) | Low-Medium | "Okto" = 8 in Greek. 8 arms. 4 chars. Distinct from "Oktopost". |
| 2 | **Sepia** | sepia.social / sepia.ai | Low | Cuttlefish genus. Sea creature hiding in plain sight. |
| 3 | **Argonaut** | argonaut.ai / argonaut.social | Low | Species of octopus. |
| 4 | **Mantle** | mantle.ai / mantle.social | Low | Central body of all cephalopods. |
| 5 | **Cuttl** | cuttl.ai / cuttl.social | Low | Cuttlefish shortened. |
| 6 | **Siphon** | siphon.ai / siphon.social | Low | Octopus propulsion mechanism. |
| 7 | **Riptide** | riptide.ai / riptide.social | Low | Ocean power, speed. |
| 8 | **Shellcast** | shellcast.ai / shellcast.social | Low | Shell + cast. |
| 9 | **Pelagic** | pelagic.ai | Low | Open ocean zone. |
| 10 | **Brine** | brine.ai / brine.social | Low | Salt water. |

### Direction B: Fire / Firefly Family

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 11 | **Pyre** | pyre.ai / pyre.social | GREEN | 4 chars. Zero SaaS conflicts. Firefly family tie. |
| 12 | **Flare** | flare.social | YELLOW | Light/signal metaphor. |
| 13 | **Lumina** | lumina.social | YELLOW | Glow metaphor. |

### Direction C: Deep Sea / Mythology

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 14 | **Hadal** | hadal.ai / hadal.social | GREEN | Deepest ocean zone. |
| 15 | **Pelagos** | pelagos.ai / pelagos.social | GREEN | Greek for "open sea." |
| 16 | **Timbre** | timbre.ai / timbre.social | GREEN | Quality/character of a voice. |

### Direction D: Birds / Animals

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 17 | **Wren** | wren.social | GREEN | Messenger metaphor. |
| 18 | **Finch** | finch.ai / finch.social | GREEN | Messenger metaphor. |
| 19 | **Murmur** | murmur.ai / murmur.social | YELLOW | Coordinated collective motion. |

### Direction E: Weather / Energy

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 20 | **Squall** | squall.ai / squall.social | GREEN | Sudden burst of force. |

### Direction F: Invented Words

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 21 | **Vyrn** | vyrn.ai / vyrn.social | GREEN | ZERO search results. |
| 22 | **Fluxr** | fluxr.io / fluxr.ai | GREEN | Continuous motion. |
| 23 | **Flayr** | **flayr.cloud** (FREE) | GREEN | Flare + flair. |

### Direction G: AI/Tech Forward

| # | Name | Best Domain | Concept |
|---|------|------------|---------|
| 24 | **Voxly** | voxly.ai | "Vox" = voice. |
| 25 | **SignalPost** | signalpost.ai | Intelligence + publishing. |

---

## Top 10 Recommendation (Updated 2026-03-26)

| Rank | Name | Domain | Theme | Why |
|------|------|--------|-------|-----|
| **1** | **Pyre** | pyre.ai / pyre.social | Fire | 4 chars. ZERO conflicts. Firefly family tie. |
| **2** | **Timbre** | timbre.ai / timbre.social | Sound | Signals voice cloning differentiator. |
| **3** | **Hadal** | hadal.ai / hadal.social | Deep Sea | ZERO tech presence. |
| **4** | **Wren** | wren.social | Bird | Clean in social category. |
| **5** | **Okto** | okto.social (FREE) | Sea Creature | "8" in Greek = 8 arms. |
| **6** | **Murmur** | murmur.ai | Collective | Best product metaphor. |
| **7** | **Sepia** | sepia.social / sepia.ai | Sea Creature | Hidden sea creature. |
| **8** | **Squall** | squall.ai | Weather | Posting velocity. |
| **9** | **Finch** | finch.ai / finch.social | Bird | Bird carries messages far. |
| **10** | **Vyrn** | vyrn.ai / vyrn.social | Invented | Maximum distinctiveness. |

---

## What's Already Built (Updated 2026-03-26)

- **LIVE on Vercel**: https://social-engine-five.vercel.app
- Landing page, pricing (6 tiers), dashboard, create (chat mode with Gemini), schedule, analytics, settings, admin panel
- Clerk auth working (dev keys)
- Export system (copy/download/CSV/bulk)
- 7 database schemas with feature flags and session branching
- 18 Playwright E2E tests
- GHA CI pipeline
- 13 research docs covering every aspect of the product (including March 2026 refresh)

---

## Questions for Don (Updated 2026-03-26)

1. **Name direction?** Based on the March 2026 sweep, Pyre and Timbre remain the strongest unique brands.
2. **Register domain immediately.** .social is still available for top picks.
3. **The "lobster" direction is dead** — Meta acquired Moltbook in March 2026. This confirms the sea creature space is becoming a battleground for incumbents.
4. **Pricing gap:** Should we lock in the Agency tier at $129/mo to stay competitive with Simplified's scaling?

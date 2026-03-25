# Product Naming, Competitive Landscape & Market Position — For Don's Review

> Compiled 2026-03-24. Updated with deep competitive research from 40+ tools, verified pricing, and domain availability checks.

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

## The 7-Feature Gap — Nobody Has All of These

We researched every tool. Here's the truth:

| Feature | Simplified | Predis.ai | Hootsuite | Buffer | Ocoya | Bolta.ai | FeedHive | ContentStudio | **Us** |
|---------|-----------|-----------|-----------|--------|-------|----------|----------|--------------|--------|
| **Public REST API** | No | No | Enterprise ($$$) | **Deprecated** | No | No | No | No | **Yes (core product)** |
| **Agentic Workflow Ready** | No | No | No | No | No | No | No | No | **Yes (API-first)** |
| **MCP/n8n/Zapier Nodes** | No | No | Zapier only | Zapier only | Zapier | No | No | Zapier | **Yes (n8n + MCP + Zapier)** |
| **Webhooks (all tiers)** | No | No | Enterprise | No | No | No | No | No | **Yes** |
| AI Text Gen | Yes | Yes | OwlyWriter | Basic | Yes | Yes | Yes | Yes | **Yes (multi-model)** |
| AI Image Gen | Yes | Yes | Templates | No | Yes | Yes (300/mo) | No | Yes (25/mo) | **Yes (FLUX/DALL-E)** |
| AI Video Gen | Yes | Yes (30s) | No | No | No | Yes (10/mo) | No | Yes (100/mo) | **Yes (planned)** |
| Voice Cloning | **Yes** | No | No | No | No | No | No | No | **Yes (XTTSv2)** |
| Multi-Platform Post | Yes | Yes | Yes | Yes | Yes (35+) | Yes | Yes (10+) | Yes | **Yes (via Zernio)** |
| Analytics → AI Loop | No | Partial | No | No | No | No | Partial | No | **Yes (planned)** |
| n8n-Style Workflow | No | No | No | No | Limited | Limited | No | No | **Yes (visual DAG)** |
| Session Branching | No | No | No | No | No | No | No | No | **Yes** |
| Export-First Model | No | No | No | No | No | No | No | No | **Yes** |

**FIVE features with ZERO coverage across all 40+ tools:**
1. **Public REST API on all tiers** — competitors either have NO API (Simplified, Predis, Bolta, FeedHive), deprecated it (Buffer), or gate it behind $10K+ enterprise plans (Hootsuite, Sprout Social). We expose the full API from day one, on every plan.
2. **Agentic workflow compatibility** — AI agents (Claude, GPT, Gemini, custom) can create content, schedule posts, pull analytics, and trigger workflows via API. No other social tool is built for the agentic era. MCP server included so agents can use it as a tool natively.
3. **Visual n8n-style workflow builder** inside a social media platform — nobody
4. **Content session branching** (fork, compare, iterate) — nobody
5. **True analytics → generation feedback loop** — nobody (FeedHive and Predis have partial prediction, not generation)

---

## Direct Competitor Deep Dives

### Simplified.com — CLOSEST COMPETITOR
- **What:** All-in-one AI content platform (text + image + video + voice clone + scheduling)
- **Price:** Free / $20/mo / $85/mo / Enterprise
- **Strengths:** Broadest feature set besides us. Has voice cloning. 7+ platforms.
- **Gaps:** No workflow automation. No session branching. No analytics feedback loop. No 3-mode UX. Generic AI — not multi-model.
- **Our edge:** Workflow automation (n8n-style), session branching, analytics → AI loop, export-first pricing, multi-model AI (Gemini + Claude vs their generic)

### Predis.ai — STRONG AI COMPETITOR
- **What:** AI-generated social posts (text + image + video + carousels) with predictive scoring
- **Price:** $19/mo (Core) / $40/mo (Rise) / $212/mo (Enterprise+)
- **Strengths:** Video generation included at base tier. Pre-publish performance prediction.
- **Gaps:** No voice cloning at any tier. No workflow automation. No session branching.
- **Our edge:** Voice cloning, workflow automation, session branching, lower Pro price ($29.99 vs $40)

### Bolta.ai — AGGRESSIVE NEWCOMER
- **What:** AI social tool with "agentic voice learning" and content loops
- **Price:** Free (5 accounts) / $19/mo (20 accounts)
- **Strengths:** Cheapest AI social tool with image+video gen. Free tier is generous.
- **Gaps:** No personal voice cloning. Limited video (10/mo free, 35/mo paid). No visual workflow builder.
- **Our edge:** Voice cloning, visual workflow builder, session branching, deeper AI (multi-model)

### ContentStudio — BEST VALUE INCUMBENT
- **What:** Content discovery + AI creation + scheduling + analytics
- **Price:** $19/mo (5 accounts, 25 AI images, 100 video credits)
- **Strengths:** Image AND video gen at $19/mo. Competitor benchmarking. CSV bulk upload.
- **Gaps:** No voice cloning. No visual workflow builder. No session branching.
- **Our edge:** Voice cloning, workflow automation, session branching. Note: their pricing undercuts ours at low tier.

### FeedHive — BEST ANALYTICS INTEGRATION
- **What:** AI scheduling with predictive performance scoring and conditional posting
- **Price:** $19/mo (Creator) / $29/mo (Brand) / $99/mo (Business)
- **Strengths:** Best analytics → scheduling feedback loop in the market. Auto-engagement triggers.
- **Gaps:** No image/video/voice generation at all. Analytics inform scheduling, not generation.
- **Our edge:** Full multimodal AI generation. Workflow automation. Session branching.

---

## Pricing Advantage — Where We Win

### Our Pro ($29.99/mo) vs. Comparable Tiers

| Competitor | Their Price | Our Savings | What They're Missing |
|-----------|------------|-------------|---------------------|
| Hootsuite Standard | $99-149/mo | **3-5x cheaper** | No voice, no image gen, no video gen |
| Sprout Social Standard | $199-249/mo | **6-8x cheaper** | No AI gen suite, 10 posts/day cap |
| Vista Social Advanced | $149/mo | **5x cheaper** | No voice, no image gen |
| Agorapulse Advanced | $149/mo | **5x cheaper** | No voice, no image/video gen |
| Loomly Starter | $49-65/mo | **1.6-2x cheaper** | No voice at any tier |
| SocialBee Accelerate | $40-49/mo | **25-38% cheaper** | No voice at any tier |
| Predis.ai Rise | $40/mo | **25% cheaper** | No voice at any tier |
| Jasper Pro | $59-69/seat | **Cheaper + we post** | No scheduling, no analytics, no video |
| Later Growth | $33-50/mo | **Match or beat** | 5 AI credits vs our 500 |

### Our Basic ($14.99/mo) vs. Entry Tiers

| Competitor | Their Cheapest | Our Savings |
|-----------|---------------|-------------|
| SocialBee Bootstrap | $24-29/mo | **38-49% cheaper** |
| Later Starter | $16-25/mo | **Competitive + 20x more AI credits** |
| Agorapulse Standard | $79/mo | **5x cheaper** |
| Loomly Starter | $49-65/mo | **3-4x cheaper** |

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

### Pricing Structure — Updated Direction

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

**Pro is the obvious buy.** At $29.99 it replaces a $229/mo Franken-stack. Agency is for teams. Premium is deliberately expensive — people who can afford it don't care, everyone else picks Pro.

**Multi-tenant at $99-149** — competitors charge $149-299 for team features. We undercut massively.

**Previous gap noted:** Jump from Pro ($29.99) to Business ($300) was too steep. The Agency tier at $99-149 bridges it.

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
| **Kraken** (multiple) | Kraken Agency (social mgmt), plus Kraken crypto exchange | HIGH — extremely crowded |
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

## Naming Options — Updated with Domain Research

### Direction A: Sea Creatures That WORK (Don's Preference)

These avoid every known conflict. Domains checked.

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 1 | **Okto** | **okto.social** (FREE) | Low-Medium | "Okto" = 8 in Greek. 8 arms. 4 chars. Distinct from "Oktopost" (different word). okto.social is confirmed available. |
| 2 | **Sepia** | sepia.social / sepia.ai | Low | "Sepia" (the warm brown tone) literally comes from the **cuttlefish genus** *Sepia*. Sea creature hiding in plain sight. Elegant, unique, zero conflicts found. |
| 3 | **Argonaut** | argonaut.ai / argonaut.social | Low | The argonaut is an **actual species of octopus**. Also = mythological explorers. Premium explorer energy. |
| 4 | **Mantle** | mantle.ai / mantle.social | Low | The mantle is the **central body of all cephalopods**. "The core of your social presence." Short, clean. |
| 5 | **Cuttl** | cuttl.ai / cuttl.social | Low | Cuttlefish shortened (like Tumblr, Flickr). Cuttlefish are the most intelligent cephalopods and change color = perfect metaphor for brand voice adaptation. |
| 6 | **Siphon** | siphon.ai / siphon.social | Low | Octopuses propel themselves by shooting water through their siphon. Content flowing through channels. |
| 7 | **Riptide** | riptide.ai / riptide.social | Low | Ocean power, speed. "Pulls attention toward you." No social media conflicts found. |
| 8 | **Shellcast** | shellcast.ai / shellcast.social | Low | Shell (ocean) + cast (broadcast). Directly describes the product function. |
| 9 | **Pelagic** | pelagic.ai | Low | The pelagic zone = open ocean. Vast, deep, boundless. Premium/enterprise feel. |
| 10 | **Brine** | brine.ai / brine.social | Low | Salt water. 5 chars, clean, memorable. |

### Direction B: Fire / Firefly Family (Parent Brand Alignment)

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 11 | **Pyre** | pyre.ai / pyre.social | GREEN | 4 chars. Zero SaaS conflicts. Evokes intensity, burning momentum. Direct Firefly family tie. Only clean fire-themed name. |
| 12 | **Flare** | flare.social | YELLOW | 5 chars. Minor conflicts (useflare.site, flare.io cybersec) but no dominant AI social player. |
| 13 | **Lumina** | lumina.social | YELLOW | 6 chars. Light/glow metaphor. No direct social posting conflicts. Multiple Lumina AI studios exist but different category. |

### Direction C: Deep Sea / Mythology (Less Saturated)

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 14 | **Hadal** | hadal.ai / hadal.social | GREEN | 5 chars. The deepest ocean zone (>6,000m). ZERO SaaS/tech presence. "Unexplored depths" = AI capabilities no one else has. |
| 15 | **Pelagos** | pelagos.ai / pelagos.social | GREEN | Greek for "open sea." Zero tech brand presence. Sounds premium. |
| 16 | **Timbre** | timbre.ai / timbre.social | GREEN | 6 chars. Quality/character of a voice. Maps directly to voice cloning differentiator. Zero SaaS competitors found. |

### Direction D: Birds / Animals (Messenger Metaphor)

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 17 | **Wren** | wren.social | GREEN | 4 chars. Clean in social/AI. Understated elegance. getwren.ai is BI (different category). |
| 18 | **Finch** | finch.ai / finch.social | GREEN | 5 chars. Clean namespace. Bird = messenger that travels far. |
| 19 | **Murmur** | murmur.ai / murmur.social | YELLOW | 6 chars. Starling murmuration = coordinated collective motion across platforms. Minor existing conflicts (murmur.com is org governance). Best metaphor for swarm-coordinated multi-platform posting. |

### Direction E: Weather / Energy

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 20 | **Squall** | squall.ai / squall.social | GREEN | 6 chars. Sudden burst of force. No tech conflicts found. Multi-platform posting velocity. |

### Direction F: Invented Words

| # | Name | Best Domain | Risk | Concept |
|---|------|------------|------|---------|
| 21 | **Vyrn** | vyrn.ai / vyrn.social | GREEN | 4 chars. ZERO search results. Blend of "viral" + modern feel. Maximally distinctive but requires brand investment. |
| 22 | **Fluxr** | fluxr.io / fluxr.ai | GREEN | 5 chars. Continuous motion/change (content flowing across platforms). Tumblr/Flickr naming convention. |
| 23 | **Flayr** | **flayr.cloud** (FREE) | GREEN | "Flare" + "flair" double meaning. Confirmed available. |

### Direction G: AI/Tech Forward

| # | Name | Best Domain | Concept |
|---|------|------------|---------|
| 24 | **Voxly** | voxly.ai | "Vox" = voice. Signals voice cloning differentiator. |
| 25 | **SignalPost** | signalpost.ai | Intelligence + publishing. Professional. |

### Names to HARD AVOID (from research)

| Name | Why |
|------|-----|
| Ember | embersocial.com exists + Ember.js framework |
| Glow | glowsocial.com is a direct AI social automation competitor |
| Beacon | beacons.ai is a funded creator platform |
| Kindle | Amazon trademark |
| Ignite | ignitesocialmedia.com is "The Original Social Media Agency" |
| Flock | flocksocial.com + Flock AI ($6M raise in 2026) |
| Drift | Acquired by Salesloft, major SaaS brand |
| Chorus | ZoomInfo's $450M acquisition |
| Pulse | pulsesocial.ai is a direct competitor |
| Raven | raventools.com is established in social media reporting |
| Inkwell / Inkling | Both have funded companies in AI content |

### .social TLD — Why It Works for Us

- **Cost:** $3.98-10/year (vs .ai at $60-80/yr)
- **Semantic fit:** We ARE a social media tool. The TLD IS our category.
- **Growing traction:** Major brands and platforms using .social (Mastodon ecosystem)
- **Differentiation:** Most SaaS tools fight for .ai or .com. We own the .social space.

---

## Top 10 Recommendation (Updated 2026-03-24 — expanded naming directions)

| Rank | Name | Domain | Theme | Why |
|------|------|--------|-------|-----|
| **1** | **Pyre** | pyre.ai / pyre.social | Fire | 4 chars. ZERO conflicts. Firefly family tie. Intensity + momentum. Only clean fire name. |
| **2** | **Timbre** | timbre.ai / timbre.social | Sound | 6 chars. ZERO SaaS competitors. Directly signals voice cloning differentiator. Premium feel. |
| **3** | **Hadal** | hadal.ai / hadal.social | Deep Sea | 5 chars. ZERO tech presence. "Deepest ocean" = capabilities no one else has reached. |
| **4** | **Wren** | wren.social | Bird | 4 chars. Clean in social category. Understated elegance. Messenger metaphor. |
| **5** | **Okto** | okto.social (FREE) | Sea Creature | 4 chars. "8" in Greek = 8 arms. Confirmed available. Distinct from Oktopost. |
| **6** | **Murmur** | murmur.ai | Collective | 6 chars. Starling murmuration = coordinated multi-platform motion. Best product metaphor. Minor conflicts worth fighting. |
| **7** | **Sepia** | sepia.social / sepia.ai | Sea Creature | 5 chars. Cuttlefish genus. Warm, creative, premium. Zero conflicts. Hidden sea creature. |
| **8** | **Squall** | squall.ai | Weather | 6 chars. Sudden burst of force. Zero tech conflicts. Posting velocity. |
| **9** | **Finch** | finch.ai / finch.social | Bird | 5 chars. Clean namespace. Bird carries messages far. |
| **10** | **Vyrn** | vyrn.ai / vyrn.social | Invented | 4 chars. ZERO search results anywhere. Maximum distinctiveness. Requires brand building. |

**Immediate action:** Run USPTO trademark search + domain availability check on top 5. Register the winner's .social domain TODAY ($3.98/yr).

---

## What's Already Built

- **LIVE on Vercel**: https://social-engine-five.vercel.app
- Landing page, pricing (6 tiers), dashboard, create (chat mode with Gemini), schedule, analytics, settings, admin panel
- Clerk auth working (dev keys)
- Export system (copy/download/CSV/bulk)
- 7 database schemas with feature flags and session branching
- 18 Playwright E2E tests
- GHA CI pipeline
- 12 research docs covering every aspect of the product

---

## Questions for Don

1. **Name direction?** (expanded — 7 themes explored, 25+ names researched)
   - Fire family: **Pyre** (only clean fire name)
   - Sound/voice: **Timbre** (voice cloning tie-in)
   - Deep sea: **Hadal** (zero tech presence anywhere)
   - Birds: **Wren**, **Finch** (messengers)
   - Sea creature: **Okto**, **Sepia**, **Murmur**
   - Weather: **Squall**
   - Invented: **Vyrn** (blank slate)

2. **Register the winner's .social domain immediately.** ~$4/year. Grab .ai too if available.

3. **The "lobster" direction is dead** — Meta acquired Moltbook (lobster mascot AI social network) in March 2026. "Molt" and lobster themes are now Meta territory. Octopus/cephalopod themes are still viable if we avoid "octo-" prefixes.

4. **Pricing gap:** Our jump from Pro ($29.99) to Business ($300) is steep. Should we add an Agency tier at ~$99-149?

5. **Simplified.com is our closest competitor** — they have text + image + video + voice cloning + posting. We beat them on workflow automation, session branching, and analytics intelligence. Worth looking at their product.

6. **First 5 users:** Who are they? What use cases? (Helps us prioritize features)

7. **Timeline:** When do we want paying customers? (We could launch export-only in a week)

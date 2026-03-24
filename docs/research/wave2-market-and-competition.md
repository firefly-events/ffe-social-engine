# Wave 2: Market Research, Competition & Strategic Decisions

> Generated 2026-03-24 from 5 research agents (2 Gemini Deep Research + 3 Sonnet)

## Market Size (Gemini Deep Research — Completed)

| Source | 2025 Size | Projected | CAGR |
|--------|-----------|-----------|------|
| Grand View Research | $29.93B | $171.62B (2033) | 24.8% |
| MarketsandMarkets | $17.5B (2022) | $51.8B (2027) | 24.2% |
| Fortune Business Insights | $32.48B | $164.52B (2034) | 19.7% |

**AI in Marketing overlay:** $31.28B (2024) → $82.23B (2030), 25% CAGR

**Our TAM/SAM/SOM:**
- TAM: $20-42B (social media management + AI marketing intersection)
- SAM: ~$5B (SMB + agencies, excludes Fortune 500)
- SOM (Year 1-3): $1.2-6M ARR (1,000-5,000 paying users, ~$100 blended ARPU)

**Buffer benchmarks:** ~65-70K paying customers, $28 ARPU, 7% monthly churn

---

## Competitive Landscape (Gemini Deep Research — Completed)

### Direct Competitors (All-in-One AI Social)

| Tool | Pricing | AI Depth | Platforms | Key Gap |
|------|---------|----------|-----------|---------|
| Predis.ai | $32-249/mo | Text+Image+Basic Video | 7 | No voice, no workflow automation |
| Ocoya | $15-159/mo | Text+Basic Image | 8+ | Shallow AI, credit limits |
| Bolta.ai | $11-29/mo | Agentic voice learning | 8 | No video gen, no n8n workflows |
| Vista Social | $79-379/mo | GPT text only | 10 | No creation suite, credit-gated |
| SocialBee | $29-99/mo | AI Copilot text | 10 | Dated UI, no video/voice |

### Scheduling Giants (Weak AI)

| Tool | Pricing | AI | Key Gap |
|------|---------|---|---------|
| Buffer | $6/channel/mo | Basic text assist | No creation, no video, no voice |
| Hootsuite | $99-249/mo | OwlyWriter (text only) | Expensive, cluttered UI |
| Sprout Social | $199-399/seat/mo | Predictive analytics | No content creation at all |

### Pure AI Creators (No Scheduling)

| Tool | Pricing | Strength | Key Gap |
|------|---------|----------|---------|
| Jasper AI | $39-69/mo | Best brand voice | No posting, no analytics |
| Copy.ai | $36+/mo | GTM workflows | No scheduling, no video |
| Lately AI | $119-199/mo | Blog→social repurposing | No video gen, opaque pricing |

### Video-First (No Management)

| Tool | Pricing | Strength | Key Gap |
|------|---------|----------|---------|
| Opus Clip | $19+/mo | Best long→short clipping | No text gen, no scheduling suite |
| Descript | $12-15/mo | Text-based video editing | No social scheduling |
| HeyGen | $24+/mo | Best avatar videos | No scheduling, no analytics |

### THE GAP: Nobody closes the full loop
No single tool does: AI text + AI image + AI video + voice cloning + multi-platform posting + analytics + n8n-style workflow automation.

Closest: Predis.ai (text+image+basic video+scheduling) but missing voice cloning and workflow builder.

---

## Moat Analysis

### Three defensible moats:

1. **Workflow Lock-in (n8n-style):** Once users build custom automation pipelines (trigger → generate → post → analyze → improve), migration cost is catastrophic. This is infrastructure, not just an app.

2. **Data Gravity (Brand DNA):** AI trains on user's past analytics, successful posts, voice samples. Leaving means losing a personalized intelligence model.

3. **Consolidation Economics:** Replacing the "Franken-stack" of Jasper ($49) + Opus ($19) + ElevenLabs ($22) + ChatGPT ($20) + Hootsuite ($99) + Zapier ($20) = $229/mo with one product at $29-149/mo.

---

## Billing Decision: Clerk Billing vs Stripe

**Research finding:** Clerk Billing is real and production-ready (launched 2025), built on Stripe under the hood. However:

**Use Stripe direct for now.** Reasons:
- Clerk Billing is still maturing — metered billing and usage records are less documented
- Our Agency tier needs metered overages ($0.01/caption, $0.20/video, $0.05/post) — Stripe Usage Records handles this natively
- Super admin dynamic pricing changes need Stripe Products/Prices API (well-documented)
- Granular per-user entitlements = our MongoDB feature flag system, not billing layer
- If Clerk Billing matures to handle all of this, migrate later — the switch is straightforward since Clerk Billing uses Stripe anyway

**PRD stays as-is: Stripe direct for billing, Clerk for auth.**

---

## Aggregator Decision: Switch to Ayrshare

**Replace Zernio with Ayrshare in PRD.** See `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/aggregator-reanalysis-ayrshare-vs-zernio.md`

Key: Zernio's pricing cliff at 50 users ($41→$833). Ayrshare scales linearly.

---

## Mac Studio Inference Capacity

Based on research (M4 Max 36GB unified memory):

**XTTSv2 voice synthesis:**
- ~4GB VRAM, 0.15 RTF
- 1 Mac Studio can handle ~6-8 concurrent voice gen sessions
- At 10 users: 1 Mac Studio is plenty (most users won't generate simultaneously)

**FFmpeg video composition:**
- VideoToolbox HW accel: 5-10 concurrent 1080p renders easily
- M4 Max media engine handles H.264/H.265/ProRes natively

**Stable Diffusion via MLX:**
- SDXL fits in 36GB with quantization
- ~5-10 sec/image at 1024x1024 (estimated from MLX community benchmarks)
- FLUX Dev may need optimization but should fit quantized

**Scaling projections:**

| Users | Mac Studios | Monthly Cost (amortized) | Cloud Equivalent |
|-------|------------|--------------------------|------------------|
| 10 | 1 | $70 | $200-400 (RunPod) |
| 25 | 1 | $70 | $500-800 |
| 50 | 2 | $140 | $1,000-1,500 |
| 100 | 3-4 | $210-280 | $2,000-3,000 |
| 250 | 6-8 | $420-560 | $5,000-8,000 |
| 500+ | Hybrid (local + cloud burst) | $700 + cloud overflow | $10,000+ |

**Break-even vs cloud:** Local Mac wins at every scale up to ~250 users. At 500+ users, hybrid approach (local base load + cloud burst via Modal/RunPod for peaks) is optimal.

**Recommendation:** Start with existing Mac Studio. Buy a second at ~25 users ($2K). Third at ~50 users. This keeps infra costs trivial compared to cloud.

---

## API Key Strategy: Build vs BYOK vs Marketplace

| Approach | When | For What |
|----------|------|----------|
| **Managed (we hold keys)** | v1 launch | Gemini text gen, FLUX images, XTTSv2 voice (all cheap/self-hosted) |
| **BYOK (user brings keys)** | v1.1+ | Expensive tools: Opus Clip, Runway, HeyGen, ElevenLabs |
| **Plugin marketplace** | v2+ | Third-party integrations: Canva, custom tools, community plugins |

---

## 3 UX Modes (Product Architecture)

All three are views of the same underlying pipeline data structure:

1. **Chat (Marblism-style):** "Make me a week of Instagram posts about our new menu" → AI generates the pipeline nodes automatically
2. **Wizard (Hootsuite-style):** Step-by-step guided creation with previews at each stage
3. **Power DAG (n8n/Dagster-style):** Visual node graph where users wire together: Source → Transform → Generate → Schedule → Post → Analyze

**Chat generates the DAG. Wizard walks through it linearly. Power users edit the graph directly.**

Cached results at each node = the session/branching system. Users can re-run any node with different AI, branch off prior work, compare variants. Cache limits = tier-gated upsell.

---

## Regulatory Notes (from Market Research)

**EU AI Act (Article 50) — enforceable August 2, 2026:**
- AI-generated content MUST be machine-readable labeled
- C2PA Content Credentials required
- Non-compliance = massive fines

**TikTok (2026):**
- Mandatory AI content disclosure
- C2PA integration for auto-detection
- Unlabeled synthetic media → suppression or permanent ban

**Action:** Build C2PA metadata embedding into the export/posting pipeline from day 1. This is a compliance requirement, not a feature.

---

## Full Research Doc Locations

| Document | Full Path |
|----------|-----------|
| Wave 1 Integration Synthesis | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/wave1-integration-synthesis.md` |
| Wave 2 Market & Competition | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/wave2-market-and-competition.md` |
| Naming & Positioning | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/naming-and-positioning.md` |
| Aggregator Re-Analysis | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/aggregator-reanalysis-ayrshare-vs-zernio.md` |
| PRD v1 | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/PRD-social-engine-v1.md` |
| Pricing Cost Analysis | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/pricing-charge-sheet-cost-analysis.md` |
| Provider Comparison (original) | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/social-posting-provider-comparison.md` |
| Self-Hosted Capacity | `/home/mdostal/Documents/work/ffe/repos/ffe-social-engine/docs/research/self-hosted-capacity-analysis.md` |
| Gemini Competitive Landscape (raw) | `/home/mdostal/.config/gemini-mcp/output/2faae9be14cada9a/deep-research-2026-03-24T18-01-28-521Z.json` |
| Gemini Market Sizing (raw) | `/home/mdostal/.config/gemini-mcp/output/2faae9be14cada9a/deep-research-2026-03-24T18-01-31-160Z.json` |

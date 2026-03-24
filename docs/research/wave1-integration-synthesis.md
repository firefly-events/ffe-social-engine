# Social Engine Integration Research — Wave 1 Synthesis

> Generated 2026-03-24 by 7 parallel research agents (4 Gemini Deep Research + 3 Claude Sonnet)

## Decision Framework

**Core question:** What tools and integrations does Social Engine need to be a true AI-first social media content creation + posting + analytics platform?

**Use cases driving this:**
- Personal blog/poetry → auto social content
- Firefly Events → weekly automated event promotion
- Shindig → share/advertise listings
- Social Engine → standalone SaaS product for anyone

---

## 1. AI Copy Generation (Agent 7 — Complete)

### Recommendation: Build with raw LLM APIs + good prompt engineering

| Tier | Model | Cost/Post | Use Case |
|------|-------|-----------|----------|
| Free | Gemini 2.0 Flash | $0.0005 | Sustainable even with no revenue |
| Pro | Gemini 2.5 Flash / Claude Haiku 4.5 | $0.002-0.004 | Better quality |
| Premium | Claude Sonnet 4.6 | $0.011 | Best brand voice, long-form |
| Enterprise | Claude Sonnet 4.6 + batch API | $0.006 | Content calendars |

**Key findings:**
- $0.01/post target easily achievable — Gemini 2.0 Flash at $0.0005/post
- Jasper/Copy.ai have NO accessible API for SaaS integration — build, don't buy
- Single API call → JSON output with all platform variants (Twitter, LinkedIn, IG, etc.)
- One gap to buy: hashtag trending data (RiteTag $49/mo or Hashtagify $29/mo)
- Predis.ai is the only tool that does copy + visuals together via API

**Architecture:** Few-shot brand voice matching via Qdrant semantic search (retrieve 3 most-similar past posts → inject as examples).

---

## 2. Automation Pipelines (Agent 6 — Complete)

### Recommendation: n8n backend (no embed license) + BullMQ rate limiting

**For MVP (fast):** n8n self-hosted as backend-only engine. Next.js frontend has its own scheduling UI. Each scheduled post calls a webhook on n8n. Legal under Sustainable Use License.

**For Scale:** Inngest for orchestration (built-in multi-tenant isolation, `sleepUntil` for scheduled posts) + BullMQ for per-platform rate limiting.

| Platform | Cost/mo at 10K workflows |
|----------|--------------------------|
| BullMQ self-hosted | $8-40 |
| n8n self-hosted | $24 |
| n8n Cloud Pro | $65 |
| Inngest Pro | $75 |
| Temporal Cloud | $100+ |

**User-configurable automation options:**
1. Inngest Workflow Kit — open-source React Flow components (recommended)
2. Zapier Partner API — 3 lines of code, 8,500 integrations
3. n8n Embed — requires enterprise sales process (skip for MVP)

**Full pipeline:** Trigger → AI Generate Content → AI Generate Image → Schedule (delayed job) → Post via aggregator → Wait 24h → Collect Analytics → Report

---

## 3. AI Video Generation (Agent 1 — Gemini Deep Research)

### Recommendation: Multi-model routing with tiered quality

| Tool | Best For | Cost (10s clip) | API Status |
|------|----------|-----------------|------------|
| Pika (via fal.ai) | Fast, cheap B-roll | $0.40-0.90 | Production-ready |
| Opus Clip | Long→Short repurposing | ~$0.15/min | Business API |
| HeyGen | Avatar presenter videos | $0.33-1.00 | Full API |
| Runway Gen-3 | Cinematic B-roll | ~$1.00 | API available |
| Kling AI | Human character motion | $1.00-1.60 | Via 302.ai proxy |
| Sora (OpenAI) | Complex + audio | $1.00-5.00 | Premium only |

**Pipeline: Blog/Event → Social Video:**
1. LLM generates script + visual prompts (GPT-4o, $0.01)
2. TTS generates narration (ElevenLabs or XTTSv2)
3. AI generates B-roll clips (Pika via fal.ai, $0.20/clip)
4. FFmpeg assembles: narration + B-roll + captions + music
5. Upload to social platforms

**Cost per 60s video:** $1.25 (economy) to $3.05 (premium)

**Self-hosted:** HunyuanVideo (13B params, 60GB VRAM) or CogVideoX (5B, 16GB VRAM) for 50K+ videos/month break-even.

---

## 4. AI Image Generation (Agent 2 — Gemini Deep Research)

### Recommendation: FLUX.2 via fal.ai/Together + Bannerbear/Placid for text overlay

**Hybrid architecture (critical insight):** AI generates backgrounds/assets, deterministic template API overlays brand fonts/logos/text. Never rely on AI alone for branded social posts.

| Provider | Cost/Image | Text Render | Style Tools |
|----------|-----------|-------------|-------------|
| FLUX.2 Pro | $0.03-0.055 | Best-in-class | LoRA fine-tune |
| DALL-E 3 | $0.04-0.08 | Good | Prompt only |
| GPT Image 1.5 | $0.01-0.167 | Excellent | Prompt only |
| Leonardo AI | $0.01-0.02 | Good | Custom LoRA |
| SD 3.5 Large | $0.065 | Very good | LoRA + ControlNet |
| Midjourney | $0.015-0.045 | Good | Style ref | ⚠️ No official API |

**Template APIs for text overlay:**
- Bannerbear: $49/mo for 1,000 images
- Placid: $19/mo for 500 images
- Custom HTML→Image (Puppeteer): $0 (self-hosted)

**Cost at scale:**
- 1,000 images/mo: $69 (FLUX + Placid) or $13.50 (self-hosted FLUX + Puppeteer)
- 10,000 images/mo: $450 (managed) or $103.50 (self-hosted)

**Self-hosted break-even:** ~5,000 images/mo. ComfyUI on RunPod Serverless → $0.01/image.

---

## 5. Voice Cloning / TTS (Agent 3 — Gemini Deep Research)

### Recommendation: ElevenLabs for MVP, migrate to XTTSv2 at scale

| Provider | Cost/1M chars | Latency | Clone Sample | Languages |
|----------|--------------|---------|-------------|-----------|
| ElevenLabs | $120-330 | 75-250ms | 1 min | 32-74 |
| Google Cloud | $16 (Neural2) | 200-400ms | 10 sec | 75+ |
| Amazon Polly | $16 (Neural) | Low | N/A | 40+ |
| Azure TTS | $15-24 | Low | Substantial | 140+ |
| XTTSv2 (self-hosted) | $0 (infra only) | <200ms | 10-20 sec | 16 |
| Fish Speech | $0 (⚠️ CC-BY-NC) | <150ms | 10-30 sec | 13+ |

**At 1,000 videos/mo:** ElevenLabs ~$330 vs self-hosted XTTSv2 ~$365. Similar cost.
**At 10,000 videos/mo:** ElevenLabs ~$1,320 vs XTTSv2 still ~$365. Self-host wins 3.6x.

**Voice cloning pipeline for SaaS:**
1. User uploads 5-30 min sample → normalize → VAD → diarization
2. Whisper transcription → speaker embedding extraction
3. Store embedding in encrypted S3, map to user ID
4. Generate narration using embedding + text script
5. Watermark audio (Resemble PerTH or equivalent)

**Legal:** Voice = biometric data under GDPR/CCPA. Need explicit opt-in, consent revocation, and verification protocol.

---

## 6. Social API Aggregators (Agent 5 — Complete)

### Recommendation: Ayrshare or Zernio for MVP, hybrid at scale

*(Full report in social-posting-provider-comparison.md — updated with latest findings)*

**Key aggregator comparison:**
- **Ayrshare**: 10 platforms, posting + analytics, $99/mo Pro
- **Zernio**: $33/mo posting + $10/mo analytics add-on
- **Buffer API**: No public third-party API
- **Direct APIs**: Free tiers exist for YouTube, Facebook, LinkedIn; X costs $100+/mo

**Cheapest path for all 8 platforms:** Ayrshare ($99/mo) or Zernio ($43/mo) handles everything vs building 8 direct integrations (3-6 months dev each).

---

## 7. Content Repurposing (Agent 4 — Gemini Deep Research)

### Recommendation: Custom pipeline (n8n + LLM) crushes commercial tools

**The market gap:** No single tool does blog → tweets + IG carousels + Reels script + LinkedIn + email. You need 3-5 tools ($262/mo) or one custom pipeline ($46/mo).

**Custom pipeline architecture:**
1. RSS/webhook trigger (new blog published)
2. Extract + clean text
3. Parallel LLM calls with platform-specific prompts
4. Quality pass ("de-AI" editor removes cliches)
5. Image resize for each platform
6. Push to scheduler/posting API

**Commercial tool findings:**
- Opus Clip: Best for video→shorts ($15-29/mo)
- Lately AI: Best for blog→social text ($99/mo) — learns brand voice
- Predis.ai: Only tool generating copy + visuals ($19/mo)
- Publer: Cheapest full scheduler with API ($5/mo)
- Jasper/Copy.ai: No accessible API for SaaS builders

**One blog post → 12 social assets → $0.05-0.10 in LLM costs.** At 20 posts/month = $5-10/mo total API cost.

---

## Total Cost Model: Social Engine v1

### Per-user infrastructure cost (monthly, at 1,000 posts/user)

| Component | Provider | Monthly Cost |
|-----------|----------|-------------|
| AI Copy Generation | Gemini 2.0 Flash | $0.50 |
| Social Posting (8 platforms) | Zernio | $43.00 |
| Analytics | Zernio add-on | $10.00 |
| Image Generation (100 images) | FLUX via fal.ai | $3.00 |
| Voice/TTS (10 videos) | ElevenLabs | $3.30 |
| Orchestration | n8n self-hosted | $2.40 (shared) |
| Hosting | Vercel | $20.00 (shared) |
| **Total platform cost** | | **~$82/mo** |

With 6 pricing tiers ($0-$299/mo), even the $9.99 Starter tier is profitable at low volume since most users won't use all features.

---

## Detailed Report Locations

| Report | Agent | Location |
|--------|-------|----------|
| AI Video Generation | Gemini | `~/.config/gemini-mcp/output/.../deep-research-*15-40-52*.json` |
| AI Image Generation | Gemini | `~/.config/gemini-mcp/output/.../deep-research-*15-40-53*.json` |
| Voice/TTS | Gemini | `~/.config/gemini-mcp/output/.../deep-research-*15-40-54*.json` |
| Content Repurposing | Gemini | `~/.config/gemini-mcp/output/.../deep-research-*15-40-55*.json` |
| Social API Aggregators | Sonnet | Task output `a06a7041051bf751e` |
| Automation Pipelines | Sonnet | Task output `ab8e2b9d8a8c96846` |
| AI Copywriting | Sonnet | Task output `a918ca4a6b3c9819f` |

---

## Next: Wave 2 — Market Positioning & Competition

With the full integration landscape mapped, Wave 2 will answer:
1. Does a product like this already exist? (build vs buy decision)
2. Who are the competitors and what's their pricing/positioning?
3. What's the market gap we're exploiting?
4. Naming and branding recommendations

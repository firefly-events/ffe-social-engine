# Pricing Charge Sheet & Cost Analysis (March 2026)

## 1. Bottom-Up Cost Per Operation

| Operation | Provider/Model | Cost Metric | Effective Cost (per unit) |
| :--- | :--- | :--- | :--- |
| **Text/Caption Gen** | Gemini 3.1 Flash-Lite | $0.40 / 1M tokens out | **$0.00008** (200 tokens) |
| **High-Quality Text** | Gemini 3.1 Pro | $12.00 / 1M tokens out | **$0.0024** (200 tokens) |
| **Image Gen** | Gemini Imagen 3 | Estimated per image | **$0.03** |
| **Voice Gen** | XTTSv2 (Self-hosted) | Compute only | **$0.00** (existing hardware) |
| **Voice Gen (Cloud)** | Modal (A100) | $2.50 / hr (per sec) | **$0.02** (30s audio) |
| **Video Composition** | FFmpeg (Self-hosted) | Compute only | **$0.00** (existing hardware) |
| **Social Posting** | Zernio (Accelerate) | $19 / mo (120 posts) | **$0.15** |
| **Auth** | Clerk Pro | $25 / mo flat | **$0.50** (at 50 users) |

## 2. Social Posting Provider Comparison (Build vs Buy)

| Metric | Option A: Zernio | Option B: bundle.social | Option C: Build (Direct OAuth) |
| :--- | :--- | :--- | :--- |
| **Entry Cost** | $19 / mo | $100 / mo | $0 (plus dev time) |
| **Limit** | 10 profiles / 120 posts | Unlimited profiles / 1k posts | Unlimited |
| **Effective Post Cost** | $0.15 | $0.10 | $0 |
| **Best For** | MVP (0-25 users) | Growth (25-100 users) | Scale (200+ users) |

### Crossover Points:
- **0-10 users**: Zernio is cheapest.
- **25-100 users**: bundle.social is best to avoid per-profile "anxiety".
- **200+ users**: Building direct OAuth integration pays for itself in ~3 months of saved fees.

## 3. Tier Margin Analysis

| Tier | Price | Monthly Cost (Avg User) | Gross Margin | Breakeven (Users) |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | $0 | $0.15 (3 vids, 20 caps) | N/A | N/A |
| **Starter** | $9.99 | $1.80 | **82%** | 6 |
| **Creator** | $14.99 | $4.50 | **70%** | 10 |
| **Pro** | $29.99 | $12.00 | **60%** | 20 |
| **Agency** | $299 | $85.00 (Fair Use Cap) | **71%** | 1 |

## 4. Fair Use Caps (Agency Tier)
To prevent "AI compute cluster" abuse, the $299 Agency tier must have soft caps:
- **Captions**: 5,000 / month
- **Videos**: 250 / month
- **Posts**: 2,500 / month
- **Voice Clones**: 50 active
*Throttling applied beyond these limits; overage billed at $0.01/cap, $0.20/vid.*

## 5. Self-Hosted Capacity (Mac Studio M4 Max)
- **Voice Gen**: ~50 concurrent seconds of audio per second of compute.
- **Video Comp**: ~10 concurrent 9:16 encodes.
- **Limit**: At ~100 active users, self-hosting will hit peak hour bottlenecks.
- **Strategy**: Burst to Modal (Cloud GPU) during peaks; keep baseline on-prem.

## 6. Build-Our-Own OAuth Timeline
- **Phase 1**: X & TikTok (2 weeks)
- **Phase 2**: Instagram & Facebook (3 weeks)
- **Phase 3**: YouTube & LinkedIn (2 weeks)
- **Total**: ~7 weeks dev time for 1 engineer ($15k - $20k cost).
- **Payback**: If paying $667/mo (Zernio Unlimited), payback is 30 months. **Recommendation: Postpone build-your-own until 200+ users.**

# Image and Video Generation Provider Pricing Comparison — 2026-03-27

This research compares current market rates for high-quality image and video generation providers to inform the pricing strategy for the Social Engine project.

---

## Image Generation Providers

| Provider | Model | Cost / Image | Notes |
| :--- | :--- | :--- | :--- |
| **Grok Imagine (xAI)** | Standard | $0.02 | OpenAI SDK compatible. |
| | Pro | $0.07 | $25 signup credit, up to $150/mo credit for data sharing. |
| **Gemini Imagen 3** | Standard | $0.03 | Vertex AI Imagen 3 Standard. High-quality photorealism. |
| | Fast | $0.03 | Vertex AI Imagen 3 Fast. Optimized for speed. |
| **Replicate FLUX.1** | Schnell | $0.003 | Cheapest high-quality option. |
| | Pro | $0.04 | |
| | FLUX.2 Pro | $0.055 | |
| **OpenAI DALL-E 3** | Standard | $0.04 | HD quality available at $0.08/img. |
| | HD | $0.08 | |
| **Stability AI** | SD 3.5 Large | $0.065 | |
| | SD 3.5 Medium | $0.035 | |
| | SD 3.5 Flash | $0.025 | |
| **Ideogram** | Flash | $0.03 | |
| | Default | $0.06 | |
| | Quality | $0.09 | |
| **Leonardo.ai** | Artisan | $30/mo | Token based. Approx. 6k-12k images. |
| | Maestro | $60/mo | |
| **Self-hosted FLUX.1** | RunPod A100 | $0.0015 - $0.0125 | ~$0.50/hr. Throughput: 120-1000 imgs/hr. |
| **Midjourney** | Enterprise/Pro | N/A | No public API. Use 302.ai/GoAPI if needed. |

---

## Video Generation Providers

| Provider | Model | Estimated Cost | Details |
| :--- | :--- | :--- | :--- |
| **Hailuo (MiniMax)** | Standard | ~$0.20 - $0.50 | Per 6s video. |
| **Gemini Veo** | Veo 2/3 | $0.35 - $0.50 | Per second. |
| **Runway Gen-3** | Standard | ~$0.50 | Per 10s video. |
| **Pika** | Pro | ~$0.15 - $0.20 | Credit based ($60/mo for 2300 credits). |
| **Kling** | Standard | $0.084 / sec | High-fidelity realism. |
| | Pro | $0.112+ / sec | |

---

## Strategic Recommendations for Social Engine

Based on the 6-tier architecture defined in GEMINI.md, the following providers and constraints are recommended:

### 1. Free Tier

- **Constraint:** **Export-only (copy caption + download video, no direct posting).**
- **Recommendation:** **Replicate FLUX.1 Schnell ($0.003/img)**
- **Rationale:** Lowest cost per image that still maintains high output quality. Perfect for the "try-one-free" mechanic where margins are tight and users must manually export content.

### 2. Starter Tier ($9.99/mo)

- **Recommendation:** **Replicate FLUX.1 Schnell ($0.003/img)** or **Grok Imagine Standard ($0.02/img)**
- **Rationale:** Maintains low operational cost while enabling direct posting capabilities.

### 3. Pro Tier ($14.99/mo)

- **Recommendation:** **Grok Imagine Standard ($0.02/img)** or **Gemini Imagen 3 Fast ($0.03/img)**
- **Rationale:** Balanced quality and performance for regular users.

### 4. Business Tier ($29.99/mo)

- **Recommendation:** **DALL-E 3 Standard ($0.04/img)** or **Gemini Imagen 3 Standard ($0.03/img)**
- **Rationale:** Higher quality outputs for professional social media management.

### 5. Growth/Agency Tier ($299/mo)

- **Recommendation:** **Ideogram Quality ($0.09/img)** or **FLUX.2 Pro ($0.055/img)**
- **Rationale:** Premium aesthetics for high-end agency clients who prioritize realism and artistic control.

### 6. Enterprise Tier

- **Feature:** **Bring Your Own Key (BYO Key)**
- **Providers:** Allow users to input their own API keys for:
  - OpenAI (DALL-E 3)
  - xAI (Grok)
  - Google (Gemini/Imagen 3)
  - Replicate (FLUX)
  - Stability AI
- **Rationale:** Reduces platform risk and operational cost while giving power users maximum flexibility.

---

*Note: Self-hosting FLUX.1 on RunPod A100 remains an option for high-volume internal processing, potentially lowering image costs to $0.0015-$0.0125 per generation depending on throughput (best case ~1000 imgs/hr on A100).*

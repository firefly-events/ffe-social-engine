# FIR-1187: Cost-Margin Reanalysis for Social Engine V1

## Executive Summary
This document provides a comprehensive reanalysis of the cost structures and margin profiles for the Social Engine platform. By leveraging a hybrid infrastructure—combining low-cost LLMs (Gemini Flash-Lite), high-efficiency image models (FLUX), and self-hosted intensive generation (XTTSv2/Video)—we achieve a robust margin profile that supports sustainable growth at a competitive $29.99/mo floor.

## 1. Tier Definitions (Hormozi Model)

The product architecture follows a high-value, tiered progression designed to maximize lead generation while maintaining high retention for professional users.

| Tier | Price | Monthly Content Limits | Features |
| :--- | :--- | :--- | :--- |
| **Free** | $0 | 5 captions, 1 video | Export only, Lead Gen focused |
| **Pro** | $29.99 | 500 caps, 25 vids, 100 posts | 5 platforms, 5 voice clones |
| **Agency** | $99.00 | Unlimited caps, 250 vids, Unlimited posts | 50 voice clones, 5 multi-tenant seats, White-label |
| **Enterprise**| $499+ | Custom / Unlimited | Dedicated hardware, priority support |

---

## 2. Infrastructure & Unit Costs

### 2.1 Variable Unit Costs
| Component | Provider | Cost Basis | Unit Cost |
| :--- | :--- | :--- | :--- |
| **Posting API** | Zernio | $33/50 users | ~$0.66 / user |
| **AI Text** | Gemini Flash-Lite | API | $0.0001 / caption |
| **AI Image** | FLUX | API | $0.03 / image |
| **Voice/Video** | Self-hosted XTTSv2 | Hardware (Amortized) | Effectively $0.00 |
| **Billing/Fee** | Stripe + Clerk | Transaction | 3.6% + $0.30 |

### 2.2 Fixed Infrastructure Costs
- **Vercel Pro:** $20/mo
- **Clerk Pro:** $25/mo
- **Convex:** $2.00 / 1M calls (Usage-based, effectively fixed at low scale)
- **MongoDB Atlas:** $0.00 (M0 Free Tier)
- **Total Fixed Base:** ~$47.00/mo

---

## 3. Per-User Cost Model & Margin Validation

### 3.1 Pro Tier ($29.99) Margin Analysis
The Pro tier is our primary "sustainable floor." 

| Cost Component | Calculation | Amount |
| :--- | :--- | :--- |
| **Transaction Fees** | ($29.99 * 0.036) + $0.30 | $1.38 |
| **Zernio Posting** | Monthly per-user allocation | $0.66 |
| **Gemini AI Text** | 500 captions * $0.0001 | $0.05 |
| **FLUX AI Images** | 25 images * $0.03 | $0.75 |
| **Self-hosted Generation**| Marginal hardware/electric | $0.00 |
| **Total COGS (Variable)** | | **$2.84** |

**Margin Calculation:**
- **Gross Profit:** $27.15
- **Gross Margin:** **90.5%**

*Validation:* Even assuming a 3x increase in API usage or higher Zernio tiers, the Pro tier maintains a margin well above the 50% target.

### 3.2 Agency Tier ($99.00) Margin Analysis
| Cost Component | Calculation | Amount |
| :--- | :--- | :--- |
| **Transaction Fees** | ($99.00 * 0.036) + $0.30 | $3.86 |
| **Zernio Posting** | Unlimited tier avg ($667/500u) | $1.33 |
| **Gemini AI Text** | 5,000 captions * $0.0001 | $0.50 |
| **FLUX AI Images** | 250 images * $0.03 | $7.50 |
| **Total COGS (Variable)** | | **$13.19** |

**Margin Calculation:**
- **Gross Profit:** $85.81
- **Gross Margin:** **86.7%**

---

## 4. Hardware Break-even Analysis

Our strategy utilizes a Mac Studio (M4 Max) for self-hosting XTTSv2 and high-intensity video tasks.

- **Monthly Cost (Hardware + Electric):** $120.00
- **Pro Unit Contribution Margin:** $27.15
- **Break-even Users:** $120 / $27.15 ≈ **4.42 Users**

With only 5 Pro users, the dedicated inference hardware is fully paid for, allowing for near-infinite scaling of voice/video generation with zero additional marginal cost until hardware capacity (estimated at 500 concurrent users) is reached.

---

## 5. Market Comparison: The $29.99 Floor

### 5.1 Comparison vs. Simplified ($20/mo)
Simplified and similar competitors often offer lower entry points (e.g., $18–$20/mo) but suffer from:
1.  **Cloud-Only Costs:** They pay per-minute for voice/video to third-party providers (ElevenLabs, HeyGen), causing margins to collapse at high usage.
2.  **Strict Limits:** To protect margins, they impose restrictive credit systems.

### 5.2 Why $29.99 is Sustainable
1.  **Buffer for Growth:** The $29.99 price point allows us to offer 500 captions and 25 videos while still clearing >90% gross margin.
2.  **CAC Coverage:** High gross margins provide a ~$25/user buffer to spend on Customer Acquisition Cost (CAC) while remaining profitable in Month 2.
3.  **Inference Independence:** Self-hosting allows us to offer "unlimited" feel on intensive features (voice cloning) that competitors must meter aggressively.

## Conclusion
The current cost model demonstrates extreme capital efficiency. The 90%+ margin on the Pro tier provides the financial ceiling necessary to fund aggressive user acquisition and R&D for the Agency and Enterprise offerings.

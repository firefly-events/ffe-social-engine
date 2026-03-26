# Guided Unlock Wizard — UX Research

**Date:** 2026-03-23
**Source:** Gemini 3.1 Pro Deep Research
**Ticket:** FIR-1164

---

## TL;DR

"Try-one-free" / reverse trial mechanics achieve **15-30% conversion** (vs 2-5% for pure freemium). Greyed features with tier badges + side panel education + one free trial per feature = optimal pattern.

---

## 1. Pattern Overview (Real Product Examples)

### Canva
- Premium assets visible in search with gold "Pro" crown badge
- Free user CAN apply premium asset (with watermark)
- Hard paywall only at download/publish — leverages endowment effect
- **Lesson:** Let users create with premium features, gate at export

### Figma
- Unlimited drafts on free tier, limited collaborative boards (3)
- Inline prompts at the limit, not before
- **Lesson:** Only gate "painkiller" features that drive real conversion

### Notion
- Commitment escalation: browse → duplicate → customize → collaborate
- Paywall hits when user has invested significant time
- **Lesson:** Build habit before asking for money

### Slack
- Free tier limits message history (10K most recent) + integrations
- Loss aversion kicks in when searching for old messages
- 30% freemium-to-paid conversion (outlier — due to institutional dependency)
- **Lesson:** Make the product indispensable before gating

---

## 2. Try-One-Free Mechanics

### Flow (for Social Engine)

```text
User sees greyed "AI Voice" button with "Creator" badge
    ↓
Click → Slide-out side panel explains feature + shows preview
    ↓
"Try it once, free" CTA (prominent) + "Skip, just upgrade" link
    ↓
User clicks "Try it once" → inline wizard appears
    ↓
User generates one AI voiceover (guided, minimal inputs)
    ↓
User sees/hears their result integrated into their content
    ↓
Attempt to export/publish → upgrade modal:
"You've used your free AI Voice trial! Upgrade to Creator
 to generate unlimited voiceovers, or remove to publish free."
```

### UI Component Selection

| Component | When to Use | Example |
|---|---|---|
| **Side Panel (Drawer)** | Feature education, voice/video config | "What is AI Voiceover?" explainer |
| **Inline Wizard (Stepper)** | The actual try-one-free experience | Voice selector → generate → preview |
| **Popup Modal (Dialog)** | Final payment/upgrade decision ONLY | "Upgrade to Creator $14.99/mo" |
| **Contextual Tooltip** | Hover on greyed features | "Voice cloning requires Pro plan" |
| **Pro Badge** | Always visible on locked features | Purple "Creator" or gold "Pro" pill |

### Key Rule: Side panel for education, modal ONLY for payment.

---

## 3. Conversion Benchmarks

| Strategy | Median Conversion | Top 10% | Notes |
|---|---|---|---|
| Pure Freemium | 2-5% | 8-12% | Massive top-of-funnel, low conversion |
| Hard Paywall | 10-12% | 25%+ | High conversion, low volume |
| Free Trial (opt-in) | 15-25% | 40%+ | Time-limited full access |
| **Reverse Trial / Try-One-Free** | **15-30%** | N/A (emerging) | Best of both worlds |

**Why reverse trial wins:** Triggers loss aversion (losing a feature feels worse than never having it). Retains non-converters in freemium growth loop. 15% conversion + 25% long-term engagement.

---

## 4. Implementation for Social Engine

### Stage 1: Text Generation (Core Free Value)
- Clean interface, no distractions
- User inputs prompt → AI generates text post
- Once approved, next stages reveal progressively

### Stage 2: Voice Generation (Try-One-Free Hook)
- Inline suggestion below text: "Enhance with AI Voice"
- UI shows: "1 Free Generation Remaining"
- Side panel for voice selection (keeps text visible)
- **This is where conversion happens**

### Stage 3: Video Generation (Hard Premium Gate)
- Greyed out with "Pro" badge, 40-50% opacity
- Click → centered modal with auto-playing example video
- NO free trial (reserve ultimate value for paid tier)
- "Upgrade to Pro" CTA

### Stage 4: Publish/Export (Decision Point)
- Free users: seamless export (copy caption + download)
- If user used free voice trial: "Upgrade to Creator to publish audio posts, or remove audio to export free"

### UI Components (Shadcn/Radix primitives)
1. **Stepper** — horizontal progress: Text → Audio → Video → Publish
2. **Popover** — hover tooltips on greyed features
3. **Sheet** — right-side drawer for voice/video config
4. **Dialog** — centered modal for upgrade payment ONLY
5. **Badge** — inline tier indicator (purple "Creator", gold "Pro")

---

## 5. Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Our Mitigation |
|---|---|---|
| **Feature dump** | Cognitive overload kills activation | Progressive 4-step wizard |
| **Deceptive affordances** | Bright locked buttons feel like a trick | 40-50% opacity + badge |
| **Dead-end greyed buttons** | Click does nothing = missed revenue | Always show explainer + CTA |
| **Premature paywalling** | Asking for money before "aha" moment | Free text generation first |
| **Forced feature tours** | Unskippable tours frustrate users | Behavior-triggered, always skippable |
| **Dark patterns** | Damages trust long-term | Clear pricing, easy downgrade |

---

## Unlock Triggers by Tier

| Tier | Price | Unlock Trigger | Try-One-Free? |
|---|---|---|---|
| **Starter** ($9.99) | Direct posting | "Post to Instagram" guided flow | Yes — 1 free direct post |
| **Creator** ($14.99) | AI voice | "Generate AI narration" guided flow | Yes — 1 free voice generation |
| **Pro** ($29.99) | Voice cloning | "Clone your voice" guided flow | No — modal with demo video |
| **Agency** ($299) | Multi-brand | "Manage brands" guided flow | No — contact sales/self-serve |

---

## Tracking Requirements

- `feature_trial_used` — boolean per feature per user
- `unlock_wizard_started` — event (feature, tier, timestamp)
- `unlock_wizard_completed` — event (converted: bool, feature, tier)
- `upgrade_source` — which feature triggered the upgrade
- PostHog events for funnel analysis

# Social Engine PRD v1 — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-24
**Author:** Firefly Events Inc.
**Status:** Approved (all decisions finalized in 2026-03-24 session)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Pricing (6 Tiers)](#2-pricing-6-tiers)
3. [Tech Stack](#3-tech-stack)
4. [UX Decisions](#4-ux-decisions)
5. [Feature Gating](#5-feature-gating)
6. [Core User Flows](#6-core-user-flows)
7. [API Architecture](#7-api-architecture)
8. [Database Schema](#8-database-schema)
9. [Infrastructure Costs](#9-infrastructure-costs)
10. [Milestones](#10-milestones)
11. [Wireframe Reference](#11-wireframe-reference)
12. [Related Tickets](#12-related-tickets)

---

## 1. Product Overview

### What Is Social Engine?

Social Engine is a **standalone AI-powered social content creation, scheduling, and analytics SaaS** product built by Firefly Events Inc. It is designed to be a self-contained product with its own authentication, billing, users, and branding. It is **not** an extension of Shindig, Reserved, or Table Top Archive (TTA).

### Strategic Position

- **Social Engine = standalone SaaS.** It has its own domain, auth, billing, and user base.
- **Glympse** is a separate product (event discovery social feed) that will consume Social Engine's APIs in the future. Glympse is NOT part of this PRD.
- Cross-product Fireflies rewards integration (loyalty points across Shindig, Social Engine, etc.) is a separate PRD to be written later.
- Social Engine shares infrastructure (MongoDB Atlas cluster, GCP project, Mac Studio M4 Max) with the broader FFE ecosystem but is operationally independent.

### Target Market

- **Solo creators** who want AI to generate their social content so they can focus on creating, not captioning.
- **Small businesses** (restaurants, local shops, event venues) that need consistent social presence without a marketing hire.
- **Agencies** managing multiple brands/clients who need white-label content generation at scale.

### Value Proposition

"AI makes my content, I approve, it posts."

No competitor combines AI content creation + scheduling + direct posting + analytics at under $30/mo. The closest alternatives either lack AI generation (Buffer, Later) or charge enterprise prices (Sprout Social, Hootsuite). Social Engine fills the gap for the $10-30/mo market segment.

### Core Capabilities

1. **AI Content Generation** — Gemini Flash generates captions, hashtags, and platform-optimized text from minimal user input.
2. **Template-First Creation** — Users pick from curated templates (Event Promo, Product Launch, Behind the Scenes, etc.) rather than starting from a blank slate.
3. **Multi-Platform Posting** — Direct posting to Instagram, TikTok, YouTube, X/Twitter, Facebook, and LinkedIn via Zernio API.
4. **Scheduling & Queuing** — Calendar-based scheduling with optimal time suggestions.
5. **Analytics** — Post performance metrics, engagement tracking, and growth analytics (Pro+ tiers).
6. **AI Voice Cloning** — Self-hosted XTTSv2 voice generation for narrated content (Pro+ tiers).
7. **Automation Pipelines** — n8n-style visual workflow builder for automated content generation (Pro+ tiers).
8. **Guided Unlock Wizard** — Try-one-free mechanics that let free users sample premium features before upselling.

---

## 2. Pricing (6 Tiers)

All 6 tiers are approved. Annual pricing is 20% off monthly.

| Tier | Monthly | Annual (20% off) | AI Captions | Videos | Posts | Voice Clones | Key Features |
|---|---|---|---|---|---|---|---|
| **Free** | $0 | - | 5/mo | 1/mo | 0 | 0 | Export only (copy/download) |
| **Starter** | $9.99 | $95.90/yr | 50/mo | 5/mo | 0 | 0 | Unlimited exports |
| **Basic** | $14.99 | $143.90/yr | 100/mo | 10/mo | 30/mo | 0 | Direct posting, scheduling |
| **Pro** | $29.99 | $287.90/yr | 500/mo | 25/mo | 100/mo | 5 | Automations, analytics |
| **Business** | $100.00 | $960.00/yr | 2,000/mo | 100/mo | 500/mo | 20 | Priority support, advanced analytics |
| **Agency** | $299.00 | $2,870.40/yr | Unlimited* | Unlimited* | Unlimited* | 50 | White-label, API access |

*Agency "Unlimited" is subject to Fair Use Caps (see below).

### Fair Use Caps (Agency Tier)

To prevent abuse, the Agency tier has soft caps:

| Resource | Soft Cap | Overage Rate |
|---|---|---|
| Captions | 5,000/mo | $0.01 per caption |
| Videos | 250/mo | $0.20 per video |
| Posts | 2,500/mo | $0.05 per post |
| Voice Clones | 50 active | Contact sales |

Throttling applied beyond caps. Overage billed automatically via Stripe metered billing.

### Cost Per Operation (Margin Analysis)

| Operation | Provider | Cost Per Unit |
|---|---|---|
| AI Caption (Flash-Lite) | Gemini 3.1 Flash-Lite | $0.00008 (200 tokens) |
| AI Caption (Pro quality) | Gemini 3.1 Pro | $0.0024 (200 tokens) |
| Image Generation | Gemini Imagen 3 | $0.03 |
| Voice Generation | XTTSv2 (self-hosted) | $0.00 (hardware amortized) |
| Voice Generation (cloud burst) | Modal A100 | $0.02 (30s audio) |
| Video Composition | FFmpeg (self-hosted) | $0.00 (hardware amortized) |
| Social Post | Zernio Accelerate | $0.15 per post |

### Tier Margin Summary

| Tier | Price | Avg Monthly Cost/User | Gross Margin |
|---|---|---|---|
| Free | $0 | $0.15 | N/A (loss leader) |
| Starter | $9.99 | $1.80 | 82% |
| Basic | $14.99 | $4.50 | 70% |
| Pro | $29.99 | $12.00 | 60% |
| Business | $100.00 | $35.00 | 65% |
| Agency | $299.00 | $85.00 | 71% |

**Breakeven:** 6 users on Starter ($9.99/mo) covers platform overhead ($58/mo at MVP).

---

## 3. Tech Stack

### Frontend

| Component | Technology | Notes |
|---|---|---|
| Dashboard | Next.js 16 (App Router) | Located at `apps/dashboard/` |
| UI Library | Shadcn/ui + Radix primitives | Tailwind CSS styling |
| Framework | React 19 | Server Components where possible |
| Build | Turborepo + pnpm workspaces | Monorepo at root |
| Testing | Jest + React Testing Library | Per-app test suites |

### Authentication

| Component | Technology | Notes |
|---|---|---|
| Auth Provider | Clerk Pro ($25/mo) | Individual users, NO orgs in v1 |
| Auth Mode | App Router middleware | `@clerk/nextjs` v7+ |
| Session | Clerk session tokens | JWT-based, server-side validation |
| Billing Auth | Stripe direct | NOT Clerk Billing — Stripe handles all payment |

**Why Clerk over Firebase Auth:** Social Engine is a standalone product. Shindig uses Firebase Auth. Using Clerk keeps the products completely independent. Clerk Pro provides the user management dashboard, webhooks, and compliance features needed for a SaaS without building them.

### Billing

| Component | Technology | Notes |
|---|---|---|
| Payment | Stripe | Direct integration, not through Clerk |
| Subscriptions | Stripe Billing | 6 products, monthly + annual prices |
| Metered Billing | Stripe Usage Records | Agency overage tracking |
| Webhooks | Stripe Webhooks | `checkout.session.completed`, `customer.subscription.*` |
| Checkout | Stripe Checkout (hosted) | Redirect-based, not embedded |

### Database

| Component | Technology | Notes |
|---|---|---|
| Primary DB | MongoDB Atlas | Shared cluster with existing FFE infrastructure |
| ODM | Mongoose | Schema validation + middleware |
| Token Encryption | MongoDB CSFLE | Client-Side Field Level Encryption for OAuth tokens |
| Connection | Existing FFE Atlas cluster | $0 incremental cost |

### AI Services

| Component | Technology | Notes |
|---|---|---|
| Caption/Hashtag Gen | Gemini 3.1 Flash-Lite | TTA GCP project API key, $0.40/1M tokens |
| High-Quality Text | Gemini 3.1 Pro | For Pro+ tier enhanced captions |
| Voice Generation | XTTSv2 (self-hosted) | Mac Studio M4 Max via MLX, 0.15 RTF |
| Voice Cloning | XTTSv2 fine-tuning | 30s sample required, stored per-user |
| Video Composition | FFmpeg (self-hosted) | VideoToolbox HW accel on M4 Max |
| Image Generation | Gemini Imagen 3 (stub) | Future: Runway ML or self-hosted SVD |

### Social Posting

| Component | Technology | Notes |
|---|---|---|
| Posting Provider | Zernio | $33/mo MVP (Accelerate plan, 50 profiles) |
| Analytics Add-on | Zernio Analytics | $10/mo, Instagram + YouTube + X + partial TikTok |
| Platforms | Instagram, TikTok, YouTube, X, Facebook, LinkedIn | Via Zernio unified API |
| Scaling | Zernio Unlimited at 50+ users | $667/mo, unlimited everything |

**Why Zernio over bundle.social:** bundle.social's 1,000 post/mo cap on the $100 Pro plan is a dealbreaker. A power user does 30+ posts/month. At just 34 power users, the cap is hit. Zernio Accelerate at $33/mo has no post cap and scales cleanly to Unlimited at $667/mo when we hit 50 users. See `docs/research/social-posting-provider-comparison.md` for full analysis.

**Why not build our own OAuth:** Direct OAuth integration costs ~$15-20K in dev time (7 weeks for 6 platforms). Payback at $667/mo Zernio cost is 30 months. Postpone build-your-own until 200+ users.

### Automation

| Component | Technology | Notes |
|---|---|---|
| Workflow Engine | n8n | Self-hosted or cloud, visual flow builder |
| Integration | n8n API + custom nodes | Trigger Social Engine workflows from n8n |
| Modes | Manual + Async | User-initiated or background processing |

### Deployment

| Component | Technology | Notes |
|---|---|---|
| Dashboard | Vercel Pro ($20/mo) | Next.js optimized hosting |
| API Gateway | Express.js on Vercel or Fly.io | TBD based on websocket needs |
| AI Services | Podman containers on Mac Studio | Voice-gen, visual-gen, composer |
| Cloud Burst | Modal (A100) | Peak hour overflow for voice/video |

### Monitoring

| Component | Technology | Notes |
|---|---|---|
| Product Analytics | PostHog | Feature flags, event tracking, funnels |
| Error Tracking | Sentry | Runtime error capture + alerting |
| Infrastructure | Prometheus + Grafana | Shared FFE monitoring stack |

### Monorepo Structure

```
ffe-social-engine/
  apps/
    dashboard/          # Next.js 16 App Router (Clerk + Stripe)
    api-gateway/        # Express.js API (orchestration hub)
  services/
    text-gen/           # Node.js — Gemini caption generation
    voice-gen/          # Python FastAPI — XTTSv2 wrapper
    visual-gen/         # Python FastAPI — image/video generation
    composer/           # Node.js — FFmpeg pipeline orchestration
  packages/
    core/               # Shared TypeScript types
    db/                 # Mongoose models + CSFLE encryption
  docs/
    business/           # Business strategy docs
    research/           # Research findings
```

---

## 4. UX Decisions

All UX decisions were finalized during the 2026-03-24 wireframe review session using Frame0.

### Dashboard Layout

**Decision: Analytics First + Action Oriented Hybrid** (combining Options B and C)

- Top section: 4 metric cards (Total Posts, Engagement Rate, Followers, AI Credits Used)
- Middle section: Quick actions bar ("Create Post", "Schedule", "View Analytics")
- Bottom section: Recent posts feed + upcoming scheduled posts
- Sidebar: Adaptive navigation (see Sidebar section below)

### Onboarding

**Decision: Step Wizard (Option B)**

A multi-step onboarding wizard that walks new users through:
1. **Welcome** — Name, profile photo, brand name
2. **Connect Accounts** — OAuth flows for social platforms (skippable)
3. **Choose Template** — Pick a default content template style
4. **First Post** — Guided creation of their first piece of content

Users can skip any step. Progress is saved. Wizard does not re-appear once completed.

### Create Content Wizard

**Decision: Template First (Option C)**

- Landing view: 6 templates displayed in a 2x3 grid
- Templates: Event Promo, Product Launch, Behind the Scenes, Weekly Recap, Quote of the Day, Custom
- Clicking a template opens the creation flow pre-populated with template structure
- Creation flow: Edit Text -> (Optional) Add Voice -> (Optional) Add Visual -> Preview -> Export/Post
- AI caption generation available at the text editing step (uses Gemini Flash)
- Template selection is the entry point, NOT a blank editor

### Schedule View

**Decision: 3 Tabbed Views**

- **Cards** (default): Scrollable list of upcoming scheduled posts as cards
- **Week**: 7-column grid showing posts per day
- **Month**: Full calendar view with post dots; clicking a day shows cards below the calendar

Cards are the default because they provide the most information at a glance. Week/Month views are for planning.

### Pricing Page

**Decision: Horizontal Cards, 2 Rows of 3 (Option A)**

- Top row: Free, Starter, Basic
- Bottom row: Pro (highlighted as "Most Popular"), Business, Agency
- Each card shows: tier name, price, key limits, feature highlights, CTA button
- Annual/Monthly toggle at the top
- $100 Business tier is the addition that fills the gap between Pro ($29.99) and Agency ($299)

### Export Experience

- **Basic export (Free/Starter):** Download modal with format options (copy text, download image/video)
- **Automation export (Pro+):** n8n flow view showing the visual pipeline with a file sidebar for selecting which outputs to export
- Free users see only the download modal; Pro+ users see both options

### Guided Unlock Wizard

**Decision: 4-Step Voice Cloning Wizard with Try-One-Free Mechanic**

The guided unlock is the primary conversion mechanism. When a free/lower-tier user clicks a locked feature:

1. **Education Panel** — Right-side drawer (Sheet) explains the feature with examples
2. **Try It Free** — "Try it once, free" CTA. User gets one free trial of the feature.
3. **Guided Experience** — Inline stepper walks user through the feature (e.g., voice selection -> record sample -> generate -> preview)
4. **Upgrade Gate** — After using the free trial, next attempt shows upgrade modal with pricing

**Key UX rules:**
- Side panel for education, modal ONLY for payment decisions
- Greyed features at 40-50% opacity with tier badge (purple "Pro" pill)
- Dead-end greyed buttons always show an explainer + CTA, never do nothing
- 15-30% expected conversion rate (vs 2-5% for pure freemium)

See `docs/research/guided-unlock-wizard-ux.md` for full research.

### Sidebar Navigation

**Decision: Adaptive Sidebar**

- **Free users:** All navigation items visible. Locked features show greyed text with tier badge (e.g., "Analytics [Pro]", "Automations [Pro]")
- **Paid users:** All items unlocked, badges removed. Clean navigation.
- Sidebar items: Dashboard, Create Content, Schedule, Analytics*, Templates, Automations*, Settings
- Items marked * are gated to specific tiers (see Feature Gating section)

### Settings Pages

Three settings tabs:

1. **Connected Accounts** — Grid of 6 platform cards (Instagram, TikTok, YouTube, X, Facebook, LinkedIn). Each card shows connection status, "Connect" / "Disconnect" button, last sync time. OAuth flow initiated from here.

2. **Billing** — Current plan card, usage meters (captions used/limit, posts used/limit, etc.), "Upgrade" or "Manage Subscription" button, billing history link to Stripe Customer Portal.

3. **Content Rules** — Toggles and defaults for content generation:
   - Default hashtag count (5, 10, 15, 20)
   - Default caption tone (Professional, Casual, Playful, Bold)
   - Auto-approve rules (e.g., "Auto-approve captions with >90% quality score")
   - Platform-specific format preferences (Instagram carousel vs single, TikTok vertical vs square)

### Automation Flow

**Decision: n8n-Style Visual Node Workflow**

- Visual canvas with draggable nodes
- Node types: Trigger (RSS, Schedule, Webhook), Generate (Text, Voice, Video), Review (Auto-approve, Manual queue), Post (Platform selection)
- Two execution modes:
  - **Manual:** User clicks "Run" to execute the flow once
  - **Async:** Flow runs automatically on trigger events
- Flow templates provided for common patterns (e.g., "RSS to Instagram", "Weekly Recap to All Platforms")

---

## 5. Feature Gating

Every feature is gated to a specific tier. Features below a user's tier are accessible; features above are locked with the Guided Unlock Wizard.

### Feature Access Matrix

| Feature | Free | Starter | Basic | Pro | Business | Agency |
|---|---|---|---|---|---|---|
| AI Caption Generation | 5/mo | 50/mo | 100/mo | 500/mo | 2,000/mo | Unlimited |
| Video Generation | 1/mo | 5/mo | 10/mo | 25/mo | 100/mo | Unlimited |
| Content Templates | 3 basic | All | All | All + custom | All + custom | All + custom + white-label |
| Export (copy/download) | Yes | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| Direct Posting | No | No | 30/mo | 100/mo | 500/mo | Unlimited |
| Scheduling | No | No | Yes | Yes | Yes | Yes |
| Analytics Dashboard | No | No | No | Yes | Yes (advanced) | Yes (advanced) |
| Voice Generation | No | No | No | Yes | Yes | Yes |
| Voice Cloning | No | No | No | 5 clones | 20 clones | 50 clones |
| Automations (n8n) | No | No | No | Yes | Yes | Yes |
| Auto-Approve Rules | No | No | No | Yes | Yes | Yes |
| Priority Support | No | No | No | No | Yes | Yes |
| White-Label | No | No | No | No | No | Yes |
| API Access | No | No | No | No | No | Yes |
| Custom Domain | No | No | No | No | No | Yes |

### Gating Implementation

- **Sidebar:** Locked features displayed at 40-50% opacity with colored tier badge
- **In-page:** Locked sections show a blurred preview with overlay CTA
- **API:** Server-side tier check on every gated endpoint. Returns `403` with `{ upgrade_required: true, minimum_tier: "pro" }`
- **Usage limits:** Tracked in MongoDB per user per billing cycle. Stripe webhook resets counts on subscription renewal.

### Guided Unlock Triggers by Tier

| Trigger | Feature | Try-One-Free? |
|---|---|---|
| Click "Post to Instagram" | Direct Posting (Basic+) | Yes, 1 free post |
| Click "Generate AI Narration" | Voice Generation (Pro+) | Yes, 1 free generation |
| Click "Clone Your Voice" | Voice Cloning (Pro+) | No, modal with demo video |
| Click "Create Automation" | Automations (Pro+) | No, modal with demo |
| Click "View Analytics" | Analytics (Pro+) | Yes, 7-day preview |
| Click "Manage Brands" | White-label (Agency) | No, contact sales |

---

## 6. Core User Flows

### Flow 1: Sign Up and Onboarding

```
1. User visits socialengine.app (or similar domain)
2. Clicks "Get Started Free"
3. Clerk auth: email/password or Google/GitHub SSO
4. Redirect to onboarding wizard:
   Step 1: Welcome — enter name, brand name
   Step 2: Connect Accounts — OAuth to social platforms (skippable)
   Step 3: Choose Template — pick default content style
   Step 4: First Post — guided creation of first content
5. Redirect to dashboard
6. Dashboard shows "Welcome" state with guided tips
```

### Flow 2: Create Content (Template-First)

```
1. User clicks "Create Content" in sidebar
2. Template grid appears (6 templates in 2x3 grid)
3. User selects a template (e.g., "Event Promo")
4. Editor opens pre-populated with template structure:
   - Text field with AI-generated caption (editable)
   - "Regenerate" button for new AI caption
   - Tone selector (Professional, Casual, Playful, Bold)
   - Hashtag count slider
5. (Optional) User clicks "Add Voice" — guided voice selection
6. (Optional) User clicks "Add Visual" — upload or AI-generate image
7. Preview panel shows final content as it will appear on each platform
8. User clicks "Export" (Free/Starter) or "Post" (Basic+)
```

### Flow 3: Schedule Content

```
1. User creates content (Flow 2) and clicks "Schedule"
2. Platform selector appears — checkboxes for connected platforms
3. Date/time picker with "Optimal Time" suggestion (based on analytics)
4. User selects date/time or accepts optimal suggestion
5. Content enters scheduling queue
6. Schedule view shows the post in Cards/Week/Month view
7. User can edit, reschedule, or cancel from the schedule view
8. At scheduled time: Zernio API posts to selected platforms
9. Post status updates: Scheduled -> Posted -> (Analytics available)
```

### Flow 4: View Analytics (Pro+ Only)

```
1. User clicks "Analytics" in sidebar
2. If tier < Pro: Guided Unlock Wizard (7-day free preview available)
3. Analytics dashboard shows:
   - Overview cards: Total reach, engagement rate, follower growth, top post
   - Time series chart: Engagement over last 7/30/90 days
   - Platform breakdown: Performance per connected platform
   - Top performing posts: Ranked by engagement
4. User can filter by platform, date range, content type
5. Data sourced from Zernio Analytics API
```

### Flow 5: Create Automation (Pro+ Only)

```
1. User clicks "Automations" in sidebar
2. If tier < Pro: Guided Unlock Wizard (no free trial)
3. Automation canvas opens with template selector
4. User picks a flow template or starts blank
5. Drag nodes onto canvas:
   - Trigger: RSS feed URL, schedule (cron), webhook
   - Generate: Text (Gemini), Voice (XTTSv2), Visual (stub)
   - Review: Auto-approve (if rules match) or Queue for Review
   - Post: Platform selection + scheduling
6. User connects nodes with edges
7. User clicks "Save" then chooses:
   - "Run Now" (manual execution)
   - "Enable" (async, runs on trigger)
8. Flow executes; results appear in content queue for review/posting
```

### Flow 6: Connect Social Accounts

```
1. User navigates to Settings -> Connected Accounts
2. 6 platform cards displayed (Instagram, TikTok, YouTube, X, Facebook, LinkedIn)
3. User clicks "Connect" on desired platform
4. Redirect to platform's OAuth consent screen
5. User grants permissions (post, read analytics)
6. Redirect to Social Engine callback URL
7. Backend stores access_token + refresh_token in MongoDB (CSFLE encrypted)
8. Card updates to show "Connected" status + account name
9. Background cron refreshes tokens before expiry
10. User can "Disconnect" at any time (revokes stored tokens)
```

### Flow 7: Upgrade Plan

```
1. User encounters a locked feature (e.g., clicks "Post to Instagram")
2. Guided Unlock Wizard activates:
   a. Side panel explains the feature
   b. "Try it once, free" CTA (if available for this feature)
   c. User tries the feature once
   d. Next attempt: upgrade modal appears
3. Upgrade modal shows:
   - Current plan vs required plan
   - Price difference
   - "Upgrade Now" CTA
4. Click "Upgrade Now" -> Stripe Checkout session
5. User completes payment on Stripe's hosted checkout page
6. Stripe webhook fires -> backend updates user tier
7. User redirected back to Social Engine
8. Feature instantly unlocked; Guided Unlock Wizard no longer triggers
9. Billing page in Settings reflects new plan + usage meters
```

---

## 7. API Architecture

All API routes are served by the Express API Gateway (`apps/api-gateway/`) and the Next.js App Router API routes (`apps/dashboard/app/api/`).

### AI Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/caption` | Clerk JWT | Generate caption + hashtags via Gemini Flash |
| POST | `/api/ai/caption/pro` | Clerk JWT (Pro+) | Enhanced caption via Gemini Pro |
| POST | `/api/ai/voice/generate` | Clerk JWT (Pro+) | Generate voice narration via XTTSv2 |
| POST | `/api/ai/voice/clone` | Clerk JWT (Pro+) | Clone voice from 30s audio sample |
| GET | `/api/ai/voice/clones` | Clerk JWT (Pro+) | List user's voice clones |
| POST | `/api/ai/image/generate` | Clerk JWT | Generate image via Gemini Imagen 3 |

### Stripe / Billing Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/stripe/checkout` | Clerk JWT | Create Stripe Checkout session for plan upgrade |
| POST | `/api/stripe/webhook` | Stripe signature | Handle subscription lifecycle events |
| GET | `/api/stripe/portal` | Clerk JWT | Generate Stripe Customer Portal URL |
| GET | `/api/billing/usage` | Clerk JWT | Get current billing cycle usage (captions, posts, etc.) |

### Social Platform Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/social/connect/:platform` | Clerk JWT | Initiate OAuth flow for a platform |
| GET | `/api/social/callback/:platform` | OAuth state | Handle OAuth callback, store tokens |
| GET | `/api/social/connections` | Clerk JWT | List user's connected social accounts |
| DELETE | `/api/social/connections/:platform` | Clerk JWT | Disconnect a social account |
| POST | `/api/social/post` | Clerk JWT (Basic+) | Post content to selected platform(s) via Zernio |
| GET | `/api/social/analytics` | Clerk JWT (Pro+) | Fetch analytics data from Zernio |

### Content Management Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/content` | Clerk JWT | List user's content (paginated) |
| POST | `/api/content` | Clerk JWT | Create new content item |
| GET | `/api/content/:id` | Clerk JWT | Get single content item |
| PUT | `/api/content/:id` | Clerk JWT | Update content item |
| DELETE | `/api/content/:id` | Clerk JWT | Delete content item |
| GET | `/api/content/templates` | Clerk JWT | List available templates |

### Schedule Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/schedule` | Clerk JWT (Basic+) | List scheduled posts |
| POST | `/api/schedule` | Clerk JWT (Basic+) | Schedule a post |
| PUT | `/api/schedule/:id` | Clerk JWT (Basic+) | Update scheduled post (time, platforms) |
| DELETE | `/api/schedule/:id` | Clerk JWT (Basic+) | Cancel a scheduled post |
| GET | `/api/schedule/optimal-times` | Clerk JWT (Pro+) | Get optimal posting times based on analytics |

### Automation Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/automations` | Clerk JWT (Pro+) | List user's automation flows |
| POST | `/api/automations` | Clerk JWT (Pro+) | Create automation flow |
| PUT | `/api/automations/:id` | Clerk JWT (Pro+) | Update automation flow |
| DELETE | `/api/automations/:id` | Clerk JWT (Pro+) | Delete automation flow |
| POST | `/api/automations/:id/run` | Clerk JWT (Pro+) | Manually trigger an automation |
| PUT | `/api/automations/:id/toggle` | Clerk JWT (Pro+) | Enable/disable async execution |

### Health & Internal

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check (DB, Zernio, AI services) |
| GET | `/api/health/services` | Internal | Detailed service status for monitoring |

---

## 8. Database Schema

All collections live in the shared MongoDB Atlas cluster. User isolation is enforced via `userId` field on every document (Clerk user ID).

### Collection: `users`

Stores user profile and subscription state. Synced from Clerk webhooks + Stripe webhooks.

```javascript
{
  _id: ObjectId,
  clerkId: String,           // Clerk user ID (indexed, unique)
  email: String,
  name: String,
  brandName: String,         // Set during onboarding
  avatarUrl: String,

  // Subscription
  tier: String,              // "free" | "starter" | "basic" | "pro" | "business" | "agency"
  stripeCustomerId: String,  // Stripe customer ID
  stripeSubscriptionId: String,
  subscriptionStatus: String, // "active" | "past_due" | "canceled" | "trialing"
  currentPeriodEnd: Date,    // Billing cycle end

  // Usage tracking (reset each billing cycle)
  usage: {
    captions: Number,        // AI captions generated this cycle
    videos: Number,          // Videos generated this cycle
    posts: Number,           // Posts published this cycle
    voiceClones: Number      // Active voice clones (not reset)
  },

  // Guided unlock tracking
  trialFeatures: {
    directPosting: Boolean,  // Has used free direct post trial
    voiceGeneration: Boolean, // Has used free voice generation trial
    analytics: Boolean       // Has used free analytics preview
  },

  // Onboarding
  onboardingCompleted: Boolean,
  onboardingStep: Number,    // Last completed step (1-4)

  // Content preferences
  preferences: {
    defaultTone: String,     // "professional" | "casual" | "playful" | "bold"
    defaultHashtagCount: Number,
    autoApproveRules: [{
      condition: String,     // e.g., "quality_score > 0.9"
      enabled: Boolean
    }]
  },

  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `social_tokens`

OAuth tokens for connected social platforms. **All token fields encrypted with MongoDB CSFLE.**

```javascript
{
  _id: ObjectId,
  userId: String,             // Clerk user ID (indexed)
  platform: String,           // "instagram" | "tiktok" | "youtube" | "x" | "facebook" | "linkedin"
  platformAccountId: String,  // Platform-specific user/account ID
  platformUsername: String,    // Display name from platform

  // CSFLE encrypted fields
  accessToken: String,        // Encrypted
  refreshToken: String,       // Encrypted
  tokenExpiresAt: Date,

  // Zernio profile mapping
  zernioProfileId: String,    // Zernio's internal profile ID for this connection

  scopes: [String],           // Granted OAuth scopes
  status: String,             // "active" | "expired" | "revoked"
  lastSyncAt: Date,
  connectedAt: Date,
  updatedAt: Date
}
```

### Collection: `content`

User-created content items (captions, media references, generated assets).

```javascript
{
  _id: ObjectId,
  userId: String,             // Clerk user ID (indexed)

  // Content
  title: String,              // Internal title (e.g., "Monday Promo")
  caption: String,            // AI-generated or user-edited caption text
  hashtags: [String],
  templateId: String,         // Reference to template used
  tone: String,               // "professional" | "casual" | "playful" | "bold"

  // Media assets
  media: [{
    type: String,             // "image" | "video" | "audio"
    url: String,              // CDN URL or local storage path
    mimeType: String,
    duration: Number,         // For audio/video (seconds)
    generatedBy: String       // "user_upload" | "gemini_imagen" | "xttts" | "ffmpeg"
  }],

  // Voice (if applicable)
  voiceCloneId: ObjectId,     // Reference to voice_clones collection
  voiceAudioUrl: String,

  // AI generation metadata
  aiMetadata: {
    model: String,            // "gemini-flash-lite" | "gemini-pro"
    promptUsed: String,
    qualityScore: Number,     // 0-1 confidence score
    tokensUsed: Number,
    generatedAt: Date
  },

  // Platform-specific variants
  variants: [{
    platform: String,         // "instagram" | "tiktok" etc.
    caption: String,          // Platform-optimized caption
    mediaFormat: String       // "carousel" | "single" | "reel" | "story"
  }],

  // State machine
  status: String,             // "draft" | "pending_review" | "approved" | "rejected" | "archived"
  feedback: [{
    text: String,
    createdAt: Date
  }],

  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `social_posts`

Records of posts sent to social platforms (historical log).

```javascript
{
  _id: ObjectId,
  userId: String,             // Clerk user ID (indexed)
  contentId: ObjectId,        // Reference to content collection
  scheduleId: ObjectId,       // Reference to social_schedules (if scheduled)

  // Posting details
  platform: String,           // "instagram" | "tiktok" | "youtube" | "x" | "facebook" | "linkedin"
  platformPostId: String,     // ID returned by platform after posting
  zernioPostId: String,       // Zernio's internal post ID

  // Status
  status: String,             // "queued" | "posting" | "posted" | "failed" | "deleted"
  failureReason: String,      // Error message if failed
  retryCount: Number,
  postedAt: Date,

  // Analytics (populated by analytics sync job)
  analytics: {
    impressions: Number,
    reach: Number,
    likes: Number,
    comments: Number,
    shares: Number,
    saves: Number,
    clicks: Number,
    engagement_rate: Number,
    lastSyncedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `social_schedules`

Scheduled posts awaiting execution.

```javascript
{
  _id: ObjectId,
  userId: String,             // Clerk user ID (indexed)
  contentId: ObjectId,        // Reference to content collection

  // Schedule
  scheduledAt: Date,          // When to post (indexed)
  timezone: String,           // User's timezone (e.g., "America/New_York")
  platforms: [String],        // ["instagram", "tiktok", "youtube"]

  // Status
  status: String,             // "pending" | "processing" | "completed" | "failed" | "canceled"
  executedAt: Date,
  failureReason: String,

  // Recurrence (future feature)
  recurring: Boolean,
  recurrenceRule: String,     // iCal RRULE format

  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `voice_clones`

Voice clone profiles for XTTSv2.

```javascript
{
  _id: ObjectId,
  userId: String,             // Clerk user ID (indexed)

  name: String,               // User-given name (e.g., "My Podcast Voice")
  sampleAudioUrl: String,     // URL to the 30s voice sample
  modelPath: String,          // Path to fine-tuned XTTSv2 model on disk
  status: String,             // "processing" | "ready" | "failed"
  processingStartedAt: Date,
  readyAt: Date,

  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `automations`

n8n-style automation flow definitions.

```javascript
{
  _id: ObjectId,
  userId: String,             // Clerk user ID (indexed)

  name: String,               // "Weekly Instagram Recap"
  description: String,

  // Flow definition (n8n-compatible node format)
  nodes: [{
    id: String,
    type: String,             // "trigger_rss" | "trigger_schedule" | "generate_text" | "generate_voice" | "review" | "post"
    position: { x: Number, y: Number },
    config: Object            // Node-specific configuration
  }],
  edges: [{
    source: String,           // Node ID
    target: String            // Node ID
  }],

  // Execution
  enabled: Boolean,           // Async mode on/off
  lastRunAt: Date,
  lastRunStatus: String,      // "success" | "failed" | "partial"
  runCount: Number,

  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// users
{ clerkId: 1 }                          // unique
{ stripeCustomerId: 1 }                 // unique, sparse
{ email: 1 }

// social_tokens
{ userId: 1, platform: 1 }             // compound unique
{ tokenExpiresAt: 1 }                  // TTL index for refresh job

// content
{ userId: 1, status: 1 }
{ userId: 1, createdAt: -1 }

// social_posts
{ userId: 1, platform: 1, postedAt: -1 }
{ status: 1, createdAt: 1 }            // For retry queue

// social_schedules
{ scheduledAt: 1, status: 1 }          // For scheduler cron
{ userId: 1, status: 1 }

// voice_clones
{ userId: 1 }

// automations
{ userId: 1 }
{ enabled: 1 }                          // For async trigger polling
```

---

## 9. Infrastructure Costs (Monthly at Launch)

### Fixed Costs

| Service | Monthly Cost | Notes |
|---|---|---|
| Clerk Pro | $25.00 | Auth + user management |
| Zernio Accelerate | $33.00 | Social posting (50 profiles) |
| Zernio Analytics Add-on | $10.00 | Instagram, YouTube, X, partial TikTok |
| Vercel Pro | $20.00 | Dashboard hosting |
| MongoDB Atlas | $0.00 | Shared with existing FFE cluster |
| Mac Studio M4 Max | $0.00 | Already owned (voice/video compute) |
| Domain + SSL | ~$2.00 | Amortized annual cost |
| **Total Fixed** | **~$90.00** | |

### Variable Costs

| Service | Cost Basis | Est. Monthly (50 users) |
|---|---|---|
| Gemini API (Flash-Lite) | $0.40/1M tokens | ~$2.00 |
| Gemini API (Pro, for Pro+ users) | $12.00/1M tokens | ~$5.00 |
| Gemini Imagen 3 | ~$0.03/image | ~$3.00 |
| Modal Cloud Burst (overflow) | $2.50/hr | ~$0.00 (not needed at 50 users) |
| Stripe Processing | 2.9% + $0.30/txn | ~$15.00 |
| **Total Variable** | | **~$25.00** |

### Total Monthly Cost at Launch

**~$115/mo** (50 users target)

### Scaling Costs

| Users | Zernio | Gemini API | Total Est. |
|---|---|---|---|
| 0-50 | $43/mo | $10/mo | ~$115/mo |
| 50-200 | $667/mo (Unlimited) | $30/mo | ~$760/mo |
| 200-500 | $667/mo | $80/mo | ~$810/mo |
| 500+ | $667/mo + build own OAuth | $150/mo | ~$900/mo |

**Revenue at 50 users (avg $15/mo):** $750/mo. Profitable at 50 users.

---

## 10. Milestones

### M1: Auth + Billing + Export MVP

**Goal:** Users can sign up, create AI-generated content, and export it.

**Deliverables:**
- Clerk auth integration (sign-up, sign-in, session management)
- Stripe integration (6 products, 12 prices, checkout, webhooks, customer portal)
- MongoDB user model with tier tracking
- Dashboard layout (sidebar, metric cards, recent content)
- Onboarding wizard (4 steps)
- Template-first create wizard (6 templates)
- AI caption generation via Gemini Flash
- Export functionality (copy text, download media)
- Usage tracking (captions, videos per billing cycle)
- Guided Unlock Wizard foundation (greyed features, tier badges)

**NOT included:** Direct posting, scheduling, analytics, voice, video, automations.

### M2: Social Posting Integration

**Goal:** Users can post content directly to social platforms and schedule posts.

**Deliverables:**
- Zernio integration (API client, authentication)
- OAuth flow for 6 platforms (via Zernio's proxy OAuth)
- Connected Accounts settings page
- `social_tokens` collection with CSFLE encryption
- "Post" button on content items (Basic+ tier)
- Platform selector (checkboxes for connected platforms)
- Post status tracking (queued -> posting -> posted -> failed)
- Retry logic for failed posts
- Schedule view (Cards, Week, Month tabs)
- Date/time picker with timezone support
- Scheduler cron job (checks `social_schedules` every minute)
- `social_posts` and `social_schedules` collections

### M3: Analytics + Dashboard

**Goal:** Users can see how their content performs across platforms.

**Deliverables:**
- Zernio Analytics integration ($10/mo add-on)
- Analytics dashboard page (Pro+ tier)
- Overview metric cards (reach, engagement, followers, top post)
- Time series charts (7/30/90 day engagement)
- Platform breakdown (per-platform performance)
- Top performing posts ranking
- Analytics sync job (periodic fetch from Zernio)
- `social_posts.analytics` field population
- Optimal posting time suggestions (based on historical data)
- 7-day free analytics preview (Guided Unlock for lower tiers)

### M4: Automations

**Goal:** Users can create automated content generation and posting workflows.

**Deliverables:**
- n8n integration (self-hosted instance or cloud API)
- Visual flow builder (canvas, draggable nodes, edges)
- Node types: Trigger (RSS, Schedule, Webhook), Generate (Text, Voice), Review, Post
- Flow templates (5+ common patterns)
- Manual execution mode ("Run Now")
- Async execution mode (trigger-based, background)
- `automations` collection
- Auto-approve rules engine
- Automation execution history / logs
- Content Rules settings page (defaults, auto-approve toggles)

### M5: Voice + Video

**Goal:** Pro+ users can generate AI voice narrations and compose videos.

**Deliverables:**
- XTTSv2 voice generation service (`services/voice-gen/`)
- Voice clone wizard (record sample -> process -> preview)
- `voice_clones` collection
- Voice selection in create wizard
- FFmpeg video composition service (`services/composer/`)
- Video template system (9:16 vertical, 1:1 square, 16:9 landscape)
- Visual generation stubs evolved to real image generation
- Cloud burst routing (Modal A100 for peak hours)
- Voice clone management in settings

### M6: Super Admin + Launch

**Goal:** Production-ready deployment with admin tooling.

**Deliverables:**
- Super admin dashboard (internal only):
  - User management (view, impersonate, ban)
  - Tier override (manual upgrades/downgrades)
  - Usage analytics (aggregate metrics)
  - Revenue dashboard (MRR, churn, ARPU)
- Production deployment:
  - Custom domain + SSL
  - Vercel production environment
  - MongoDB production indexes
  - Sentry error tracking
  - PostHog analytics events
  - Rate limiting on all API endpoints
  - CORS configuration
  - Security audit (OWASP top 10)
- Launch checklist:
  - Terms of Service + Privacy Policy
  - GDPR compliance (data export, deletion)
  - Stripe Tax integration
  - Email transactional (Resend: welcome, receipt, usage alerts)
  - Landing page / marketing site

---

## 11. Wireframe Reference

All wireframes were created in Frame0 during the 2026-03-24 design session. They are stored in `wireframes.json` at the repo root.

| Frame0 Page Name | Corresponds To | Decision |
|---|---|---|
| Dashboard Option B - Analytics | Dashboard (analytics-first layout) | **Selected** (hybrid with Option C) |
| Dashboard Option C - Action | Dashboard (action-oriented layout) | **Selected** (hybrid with Option B) |
| Onboarding Option A - Single Page | Onboarding (single page form) | Rejected |
| Onboarding Option B - Wizard | Onboarding (step wizard) | **Selected** |
| Onboarding Option C - Interactive | Onboarding (interactive tour) | Rejected |
| Create Wizard Option A - Linear Steps | Content creation (step-by-step) | Rejected |
| Create Wizard Option B - All in One | Content creation (single panel) | Rejected |
| Create Wizard Option C - Templates | Content creation (template grid) | **Selected** |
| Settings - Accounts Option A | Settings: Connected Accounts | **Selected** |
| Settings - Billing Option A | Settings: Billing & Plan | **Selected** |
| Settings - Content Rules Option A | Settings: Content Generation Rules | **Selected** |

**Additional wireframes needed (not yet created):**
- Schedule view (Cards, Week, Month tabs)
- Analytics dashboard (Pro+ tier)
- Automation flow builder (n8n-style canvas)
- Pricing page (horizontal cards, 2 rows of 3)
- Guided Unlock Wizard (side panel + upgrade modal)
- Export modal (basic download + n8n flow view)

---

## 12. Related Tickets

All Social Engine tickets are in the Linear project "FFE Social Engine" under Firefly Events Inc.

### Infrastructure & Setup

| Ticket | Title | Status |
|---|---|---|
| FIR-1139 | [Social Engine] Initialize monorepo with Turborepo + pnpm workspaces | Done |
| FIR-1140 | [Social Engine] Set up Express API Gateway skeleton | Done |
| FIR-1141 | [Social Engine] Create text-gen service with Gemini integration | Done |
| FIR-1142 | [Social Engine] Create voice-gen service with XTTSv2 FastAPI wrapper | Done |
| FIR-1143 | [Social Engine] Create visual-gen service stub | Done |
| FIR-1145 | [Social Engine] Create composer service (FFmpeg pipeline) | Done |
| FIR-1146 | [Social Engine] Implement content pipeline orchestration | Done |
| FIR-1147 | [Social Engine] Implement Next.js dashboard | Done |
| FIR-1148 | [Social Engine] Multi-tenant architecture research | Done |

### Auth & Billing

| Ticket | Title | Status |
|---|---|---|
| FIR-1158 | [Social Engine] Clerk auth setup — individual users, App Router middleware | In Progress |

### Research & Planning

| Ticket | Title | Status |
|---|---|---|
| FIR-1157 | [Social Engine] Social posting API provider comparison | Done |
| FIR-1163 | [Social Engine] Pricing/tier research — charge sheet with feature matrix | Done |
| FIR-1164 | [Social Engine] Guided unlock wizard UX research | Done |
| FIR-1167 | [Social Engine] Content pipeline architecture design | Done |
| FIR-1168 | [Social Engine] Self-hosted capacity analysis (Mac Studio M4 Max) | Done |
| FIR-1176 | [Social Engine] Pipeline enforcement rules for agent prompts | Done |

### Pending / Future

| Ticket | Title | Status |
|---|---|---|
| TBD | [Social Engine] Stripe integration — 6 products, 12 prices, webhooks | Not Created |
| TBD | [Social Engine] MongoDB schema — users, social_tokens, content, etc. | Not Created |
| TBD | [Social Engine] Zernio integration — posting + analytics | Not Created |
| TBD | [Social Engine] Dashboard redesign — analytics-first + action hybrid | Not Created |
| TBD | [Social Engine] Template-first create wizard | Not Created |
| TBD | [Social Engine] Schedule view (Cards, Week, Month) | Not Created |
| TBD | [Social Engine] Guided Unlock Wizard implementation | Not Created |
| TBD | [Social Engine] n8n automation integration | Not Created |
| TBD | [Social Engine] Voice cloning wizard | Not Created |
| TBD | [Social Engine] Super admin dashboard | Not Created |

---

## Appendix A: Content Pipeline State Machine

```
TRIGGERED -> GENERATING -> PENDING_REVIEW -> APPROVED -> SCHEDULED -> POSTED -> ANALYZED
                               |                                         |
                               v                                         v
                           FEEDBACK -> REGENERATING ----+            ARCHIVED
                               |                        |
                               v                        |
                         AGENT_REVIEW ------------------+
                               |
                               v
                           REJECTED -> ARCHIVED
```

See `docs/business/social-engine-content-pipeline.md` for the full Mermaid diagrams and detailed flow.

## Appendix B: Self-Hosted Capacity Summary

| Operation | M4 Max Throughput | Cloud Burst Threshold |
|---|---|---|
| Voice Gen (XTTSv2) | 400 min audio/hr | Queue depth > 5 concurrent |
| Video Encode (FFmpeg) | 800 videos/hr | Queue depth > 10 concurrent |
| Transcription (Whisper) | 3,000 min audio/hr | N/A (not user-facing) |

- **0-50 users:** 100% self-hosted, latency < 10s
- **50-250 users:** Baseline self-hosted + peak cloud burst (Modal A100)
- **500+ users:** Cloud baseline, Hive as specialized worker

See `docs/research/self-hosted-capacity-analysis.md` for full analysis.

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **Clerk** | Third-party auth provider used for user management |
| **Zernio** | Social media posting API provider (posts to 6+ platforms) |
| **XTTSv2** | Open-source text-to-speech model used for voice generation |
| **CSFLE** | MongoDB Client-Side Field Level Encryption for token security |
| **n8n** | Open-source workflow automation tool used for content pipelines |
| **Guided Unlock** | UX pattern where locked features offer a one-time free trial before upselling |
| **Hive** | Mac Studio M4 Max build box used for self-hosted AI compute |
| **Modal** | Cloud GPU provider used for burst compute during peak hours |
| **HITL** | Human-in-the-Loop — content generated by AI but reviewed by humans |

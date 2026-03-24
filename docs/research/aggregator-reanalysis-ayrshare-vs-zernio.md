# Aggregator Re-Analysis: Ayrshare vs Zernio (PRD-Contextualized)

> Generated 2026-03-24. Replaces prior Zernio recommendation.

## DECISION: Switch to Ayrshare

Zernio has a pricing cliff at 50 users ($41/mo Accelerate → $833/mo Unlimited). No graceful scaling. Ayrshare Business plan scales linearly from $42/mo to $180/mo at 1,000 users.

## Launch Strategy: Export-First + Provider Abstraction

1. v1 launches with EXPORT ONLY (Free + Starter tiers)
2. Auto-posting = Basic tier ($14.99/mo) and above
3. Provider abstraction layer built in v1 (even before auto-posting ships)
4. Ayrshare profiles created on-demand when user upgrades and connects first platform

## Ayrshare Key Capabilities (Confirmed)

- **Per-user platform toggle**: YES — Profiles API link/unlink social networks independently
- **Sub-account isolation**: YES — Full Profiles API, one profile per user
- **Per-post analytics**: YES — impressions, engagement, reach per post across all networks
- **Platform support**: Instagram, TikTok, YouTube, X, Facebook, LinkedIn, Pinterest, Threads (13+ total)
- **OAuth link generation**: Generate social network linking URL per user profile

## Cost Projections

| Total Users | Auto-Post Users (60%) | Ayrshare/mo | Your Revenue/mo | Aggregator % |
|-------------|----------------------|-------------|-----------------|-------------|
| 10 | 6 | $42 | $170 | 24% |
| 50 | 30 | $43 | $840 | 5% |
| 100 | 60 | $48 | $1,680 | 2.9% |
| 500 | 300 | $113 | $8,400 | 1.3% |
| 1,000 | 600 | $180 | $16,800 | 1.1% |

## Why NOT Build Direct OAuth

- Meta App Review: 2-8 weeks, can be rejected
- TikTok compliance audit: unknown timeline, posts go private-only without it
- Build cost: $72-108K one-time + $30-60K/year maintenance
- Break-even vs Ayrshare: ~15,000+ users (never practical at our scale)
- Ayrshare inherits approved developer relationships — critical for TikTok

## Provider Abstraction Layer Design

```
SocialEngine.post(userId, content, platforms[])
  → SocialEngine.getProvider(user.plan)
    → AyrshareProvider.post()   // today
    → DirectInstagramProvider.post()  // future, if needed
```

Your layer owns: post count tracking, platform-enabled state, tier limit enforcement, analytics cache
Aggregator owns: OAuth tokens, platform API complexity, media handling, rate limits

## What You Gate Per Tier

| Tier | Platforms | Posts/mo | Analytics |
|------|-----------|----------|-----------|
| Free | 0 (export only) | 0 | No |
| Starter | 0 (export only) | 0 | No |
| Basic | 3 | 30 | Basic |
| Pro | 5 | 100 | Full |
| Business | All | 500 | Full + Advanced |
| Agency | All + API | 2,500 (soft) | Full + Advanced + Export |

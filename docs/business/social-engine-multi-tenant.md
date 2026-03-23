# Social Engine: Multi-Tenant Architecture & Productization Research

## 1. User Accounts & OAuth
To productize the Social Engine, each user must maintain independent OAuth connections to their respective social platforms (TikTok, Instagram, YouTube, X). 
- **Identity Provider (IdP):** Use an identity provider like Clerk or Auth0, or extending Firebase Auth if currently used by Shindig. 
- **OAuth Delegation:** Store platform-specific OAuth refresh/access tokens securely in an encrypted Vault or AWS KMS. When a post is scheduled, the backend retrieves the user-specific token to push content.

## 2. Tenant Isolation
Every database model must include a `tenantId` (or `organizationId`) foreign key to ensure strict row-level security (RLS).
- **Database:** Prisma schemas should use middleware or PostgreSQL Row Level Security (RLS) to ensure queries automatically filter by `tenantId`.
- **Assets:** S3/GCS buckets must be partitioned by tenant (e.g., `s3://bucket/tenant-uuid/voices/`).
- **Data Models:** Voices, Templates, Content, and Posts must explicitly belong to a tenant to prevent accidental cross-tenant data leaks.

## 3. Connecting Social Accounts
Users will connect their social accounts via a dedicated "Integrations" page on the dashboard.
- **Flow:** User clicks "Connect TikTok" -> Redirects to TikTok OAuth -> Returns to our callback URL -> Store `access_token` and `refresh_token` against the `tenantId`.
- **Permissions:** Request granular permissions (e.g., `video.upload`, `tweet.write`) to maintain trust. Token refreshing must be managed by a background cron job to avoid expired sessions at posting time.

## 4. Integration with Third-Party Tools (e.g., Opus Clip)
- **Webhooks:** Expose inbound webhooks to receive rendered video events from Opus Clip or similar platforms.
- **Pipeline:** An Opus video can trigger the "Composer" step or skip directly to "Post" step. The Social Engine acts as the central orchestration hub, tracking third-party content identically to natively generated content.

## 5. Pricing Model
- **Free Tier:** 3 generated videos/month. Watermarked output. 1 custom voice limit.
- **Pro Tier ($29/mo):** 30 videos/month. Unwatermarked. Up to 5 custom voices. Auto-posting to 3 platforms.
- **Enterprise / Pay-as-you-go:** High volume users pay per video (e.g., $0.50 per generation). Usage tracked via Stripe Metered Billing tied to successful API Gateway executions.

## 6. Synergy with Shindig
- **Access Strategy:** For existing Shindig event organizers, Social Engine should be accessible via an SSO redirect or an embedded iframe within the Shindig dashboard.
- **Data Sharing:** Event details from Shindig can automatically seed the "Event Promo" pipeline, offering organizers a 1-click marketing video generation experience.

## 7. White-Label Possibilities
- **Custom Domains:** Allow agencies to host the dashboard on `socials.theiragency.com`.
- **Theming:** CSS variables driven by tenant config (e.g., primary colors, logo overrides) for the React frontend.
- **API Access:** Offer a developer tier allowing B2B customers to call our API Gateway directly, bypassing our dashboard entirely.

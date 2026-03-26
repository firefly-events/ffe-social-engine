# FFE Social Engine — PostHog Event Schema

This document defines the canonical event names and properties for the `ffe-social-engine`
application. All events are prefixed with `se_` to distinguish them from other FFE apps.

**Ticket:** FIR-1179
**Created:** 2026-03-25
**App:** `ffe-social-engine` (dashboard Next.js app + api-gateway)

---

## Naming Convention

**Format:** `se_{object}_{action}` or `se_{action}_{object}`
**Prefix:** `se_` — all social-engine events use this prefix
**Case:** `snake_case`

---

## User Lifecycle Events

| Event | Description | Required Props | Optional Props | Emitted By |
|-------|-------------|----------------|----------------|------------|
| `se_user_signed_up` | User completed registration | `user_id`, `email_domain`, `signup_method` | `referrer`, `utm_source`, `utm_medium`, `utm_campaign` | dashboard (Clerk webhook) |
| `se_onboarding_started` | User entered the onboarding wizard | `user_id` | `returning` (bool — true if user navigated back) | dashboard client |
| `se_onboarding_step_completed` | User completed one onboarding step | `user_id`, `step` (`connect_accounts`\|`brand_voice`\|`first_content`\|`first_schedule`), `step_number` (1–4) | `platforms_selected` (array, step 1 only), `tone_selected` (string, step 2 only), `time_spent_seconds` | dashboard client |
| `se_onboarding_completed` | User finished all 4 onboarding steps | `user_id`, `platforms_count`, `tone`, `frequency` | `total_time_seconds`, `steps_skipped` (array) | dashboard client |
| `se_email_verified` | User verified their email address | `user_id` | `method` (`link`\|`code`) | dashboard (Clerk webhook) |

### Property Reference — User Lifecycle

```json
{
  "user_id": "user_abc123",
  "email_domain": "gmail.com",
  "signup_method": "email | google | github",
  "referrer": "https://...",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring-2026",
  "step": "connect_accounts | brand_voice | first_content | first_schedule",
  "step_number": 1,
  "platforms_selected": ["instagram", "tiktok"],
  "tone_selected": "professional",
  "time_spent_seconds": 45,
  "returning": false,
  "total_time_seconds": 180,
  "steps_skipped": ["first_content"],
  "platforms_count": 2,
  "frequency": "3",
  "method": "link | code"
}
```

---

## Account & Integration Events

| Event | Description | Required Props | Optional Props | Emitted By |
|-------|-------------|----------------|----------------|------------|
| `se_platform_connected` | User successfully linked a social platform | `user_id`, `platform` | - | dashboard client |
| `se_platform_disconnected` | User unlinked a social platform | `user_id`, `platform` | - | dashboard client |

### Property Reference — Account & Integration

```json
{
  "user_id": "user_abc123",
  "platform": "instagram | tiktok | twitter | linkedin | facebook | youtube"
}
```

---

## Content Pipeline Events

| Event | Description | Required Props | Optional Props | Emitted By |
|-------|-------------|----------------|----------------|------------|
| `se_content_created` | User created a content item (draft or published) | `user_id`, `content_id`, `platforms` (array), `status` (`draft`\|`published`\|`scheduled`) | `ai_model`, `has_image`, `has_audio`, `has_video`, `content_type` | dashboard (POST /api/content) |
| `se_content_exported` | User exported/copied content for manual posting | `user_id`, `content_id`, `platform` | `export_format` (`text`\|`image`\|`full`) | dashboard client |
| `se_content_scheduled` | User scheduled content for a future date | `user_id`, `content_id`, `platforms` (array), `scheduled_for` (ISO 8601) | `hours_until_post`, `frequency_slot` | dashboard (POST /api/schedule) |
| `se_content_posted` | Content was successfully published to a platform | `user_id`, `content_id`, `platform`, `post_id` | `scheduled` (bool), `retry_count` | api-gateway (post publisher) |
| `se_content_failed` | Content publishing failed | `user_id`, `content_id`, `platform`, `error_type` | `error_message`, `retry_count`, `retryable` (bool) | api-gateway (post publisher) |
| `se_ai_content_generated` | AI model generated content for the user | `user_id`, `model` (`gpt-4o`\|`gpt-4`\|`claude-3-5-sonnet`\|`claude-3-haiku`\|`gemini-1.5-pro`\|`gemini-flash`), `platforms` (array) | `prompt_tokens`, `completion_tokens`, `generation_time_ms`, `tone`, `content_type` | api-gateway (text-gen service) |

### Property Reference — Content Pipeline

```json
{
  "content_id": "cnt_abc123",
  "platforms": ["instagram", "tiktok"],
  "platform": "instagram",
  "status": "draft | published | scheduled",
  "ai_model": "gpt-4o | claude-3-5-sonnet | gemini-1.5-pro | ...",
  "has_image": true,
  "has_audio": false,
  "has_video": false,
  "content_type": "events | behind-the-scenes | educational | promotional | storytelling",
  "export_format": "text | image | full",
  "scheduled_for": "2026-03-26T18:00:00Z",
  "hours_until_post": 24,
  "frequency_slot": "Tue-6pm",
  "post_id": "ext_platform_post_id",
  "scheduled": true,
  "error_type": "auth_revoked | rate_limited | platform_error | timeout",
  "error_message": "OAuth token expired",
  "retry_count": 1,
  "retryable": true,
  "model": "gpt-4o",
  "prompt_tokens": 512,
  "completion_tokens": 256,
  "generation_time_ms": 2300,
  "tone": "professional",
  "platforms_count": 2
}
```

---

## Feature Adoption Events

| Event | Description | Required Props | Optional Props | Emitted By |
|-------|-------------|----------------|----------------|------------|
| `se_voice_clone_started` | User initiated a voice clone upload | `user_id` | `mime_type`, `file_size_bytes` | dashboard client |
| `se_voice_clone_completed` | Voice clone processing finished (status: ready) | `user_id`, `clone_id` | `processing_time_ms` | api-gateway (voice-gen service callback) |
| `se_workflow_created` | User created an automation workflow | `user_id`, `workflow_id`, `node_count` | `trigger_type` (`schedule`\|`webhook`\|`new-event`), `has_ai_node` (bool) | dashboard (POST /api/workflows) |
| `se_workflow_executed` | Workflow run triggered (scheduled or manual) | `user_id`, `workflow_id`, `trigger_type` | `execution_id`, `node_count` | api-gateway (workflow runner) |
| `se_automation_triggered` | Any automation action fired (broader than workflow) | `user_id`, `automation_type` | `source_event`, `target_platform` | api-gateway |

### Property Reference — Feature Adoption

```json
{
  "clone_id": "vc_abc123",
  "processing_time_ms": 12000,
  "mime_type": "audio/wav",
  "file_size_bytes": 2097152,
  "workflow_id": "wf_abc123",
  "node_count": 5,
  "trigger_type": "schedule | webhook | new-event",
  "has_ai_node": true,
  "execution_id": "exec_abc123",
  "automation_type": "post_on_new_event | scheduled_post | webhook_reply",
  "source_event": "trigger:new-event",
  "target_platform": "instagram"
}
```

---

## Revenue Events

| Event | Description | Required Props | Optional Props | Emitted By |
|-------|-------------|----------------|----------------|------------|
| `se_plan_upgraded` | User upgraded to a higher tier | `user_id`, `from_plan`, `to_plan` | `mrr_delta_cents`, `trigger` (`manual`\|`trial_end`\|`feature_gate`) | dashboard (Stripe webhook) |
| `se_plan_downgraded` | User downgraded to a lower tier | `user_id`, `from_plan`, `to_plan` | `mrr_delta_cents`, `reason` | dashboard (Stripe webhook) |
| `se_subscription_cancelled` | User cancelled their subscription | `user_id`, `plan`, `cancel_at` (ISO 8601) | `reason`, `feedback`, `months_active` | dashboard (Stripe webhook) |
| `se_trial_started` | User began a free trial | `user_id`, `trial_plan`, `trial_ends_at` (ISO 8601) | `trial_length_days`, `trigger` | dashboard (Stripe webhook or Clerk) |
| `se_trial_converted` | Trial user completed checkout and became paying | `user_id`, `plan`, `amount_cents` | `trial_length_days`, `days_remaining_at_convert` | dashboard (Stripe webhook) |
| `se_checkout_started` | User opened the checkout/upgrade page | `user_id`, `target_plan` | `current_plan`, `trigger` (`pricing_page`\|`feature_gate`\|`trial_end`) | dashboard client |
| `se_checkout_completed` | User completed payment successfully | `user_id`, `plan`, `amount_cents`, `interval` (`month`\|`year`) | `stripe_session_id`, `coupon_applied` (bool), `discount_percent` | dashboard (Stripe webhook) |

### Property Reference — Revenue

```json
{
  "from_plan": "free | starter | pro | business",
  "to_plan": "starter | pro | business | enterprise",
  "plan": "starter | pro | business | enterprise",
  "mrr_delta_cents": 2900,
  "trigger": "manual | trial_end | feature_gate | pricing_page",
  "reason": "too_expensive | missing_features | switching_product | other",
  "feedback": "free text (max 500 chars)",
  "months_active": 3,
  "cancel_at": "2026-04-25T00:00:00Z",
  "trial_plan": "pro",
  "trial_ends_at": "2026-04-08T00:00:00Z",
  "trial_length_days": 14,
  "days_remaining_at_convert": 6,
  "amount_cents": 2900,
  "interval": "month | year",
  "target_plan": "pro",
  "current_plan": "free",
  "stripe_session_id": "cs_test_...",
  "coupon_applied": false,
  "discount_percent": 0
}
```

---

## Property Standards

### User Properties (set via `$identify` on auth)

```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "created_at": "2026-03-25T12:00:00Z",
  "plan": "free | starter | pro | business | enterprise",
  "plan_interval": "month | year",
  "trial_active": true,
  "trial_ends_at": "2026-04-08T00:00:00Z",
  "onboarding_completed": false,
  "platforms_connected": ["instagram", "tiktok"],
  "content_count": 12,
  "app": "social-engine"
}
```

### General Standards

- **IDs:** string format (`"content_id": "cnt_abc123"`)
- **Amounts:** USD cents (`"amount_cents": 2900` = $29.00)
- **Timestamps:** ISO 8601 (`"scheduled_for": "2026-03-26T18:00:00Z"`)
- **Booleans:** `true`/`false`, never strings
- **Arrays:** only for multi-value properties (platforms, steps_skipped)

---

## Implementation Checklist

### Per-App Setup

- [ ] PostHog SDK initialized (posthog-js client-side, posthog-node server-side)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` in env
- [ ] `$identify` called on Clerk `auth()` resolution with user traits
- [ ] Session replay initialized for `/onboard/*`, `/checkout/*`, `/pricing/*`
- [ ] All `se_*` events implemented per this schema

### Dashboard Setup

- [ ] Run `node scripts/posthog-provision.js --app social-engine --project <SE_PROJECT_ID>`
- [ ] Verify cohorts created in PostHog UI
- [ ] Configure test account filters in project settings
- [ ] Validate funnel tiles load data

---

*Generated for FIR-1179 — 2026-03-25*

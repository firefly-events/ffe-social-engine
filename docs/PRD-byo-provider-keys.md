# PRD: Bring Your Own Provider Keys (BYO)

**Status:** Draft
**Author:** AI Agent (FIR-1289)
**Date:** 2026-03-27
**Ticket:** FIR-1289

---

## Overview

Pro and Agency users who already have contracts with AI providers (OpenAI, Anthropic, Google, Stability AI, ElevenLabs) can connect their own API keys to Social Engine. When a BYO key is used, the operation bypasses the credit system entirely — the cost goes directly to the user's provider account. This gives power users unlimited headroom beyond their plan credits while preserving Social Engine's credit model for users who prefer managed access.

---

## Problem Statement

1. **Agency users managing many clients can exhaust 200 credits quickly** if they run high-cost video generation. They either upgrade to Enterprise or churn to self-hosted solutions.
2. **Developers and technical users already have Google/Anthropic contracts** at negotiated rates. Forcing them through Social Engine's credit markup reduces value perception for this cohort.
3. **Without a BYO escape valve**, the credit system has no safety valve for power users — every heavy user needs an Enterprise conversation.

---

## Goals / Non-Goals

### Goals
- Allow Pro and Agency users to connect API keys for supported providers.
- BYO operations consume zero Social Engine credits.
- Users choose per-operation whether to use their BYO key or their included credits.
- Keys are stored encrypted (AES-256) and never exposed in API responses.
- Key validity is checked on save and surfaced as a status badge.
- Implement a clean `ProviderAdapter` interface so adding new providers is a small, isolated change.

### Non-Goals
- BYO keys for Free or Starter tiers — this is a paid-tier differentiation.
- Automatic fallback from BYO key to included credits on provider error (user must explicitly choose; silent fallback would cause unexpected credit deduction).
- Key sharing across team seats within an Agency account (each seat manages its own keys in V1).
- Cost passthrough billing (Social Engine does not invoice users for their BYO usage — that's between the user and their provider).

---

## User Stories

1. **As a Pro user with a Google Cloud account**, I want to connect my Gemini API key so I can run Veo video generation against my own quota instead of consuming my 50 plan credits.
2. **As an Agency user**, I want to choose per-generation whether to use my ElevenLabs key or my included voice credits, so I can use my own key for client work and keep plan credits for internal use.
3. **As any user**, I want to know immediately if my BYO key is invalid, so I am not surprised by a failed generation.
4. **As a security-conscious user**, I want to revoke a BYO key from Social Engine without affecting my provider account, so I can rotate keys safely.
5. **As a user**, I want to see which BYO keys are active and when they were last used, so I can audit my connected integrations.

---

## Technical Design

### Supported Providers (V1)

| Provider | Models Unlocked | Notes |
|----------|----------------|-------|
| Google (Gemini / Veo / Imagen) | All video, image, and text models | Requires `generativelanguage.googleapis.com` API key |
| ElevenLabs | HD voice generation | Requires ElevenLabs API key |
| OpenAI | Text (GPT-4o, GPT-4o-mini) | Future: DALL-E image generation |
| Anthropic | Text (Claude 3.5 Sonnet, Haiku) | Text generation only |
| Stability AI | Image generation | Stable Image Core / Ultra |

Providers are registered in a config array — adding a new provider requires implementing the `ProviderAdapter` interface plus one config entry, no other code changes.

### Key Storage

BYO keys are stored in MongoDB using the AES-256 encryption utilities already present in `packages/db`:

```typescript
// packages/db/src/models/UserProviderKey.ts

export interface IUserProviderKey {
  _id: ObjectId;
  userId: string;           // Clerk user ID
  providerId: string;       // "google" | "elevenlabs" | "openai" | "anthropic" | "stability-ai"
  encryptedKey: string;     // AES-256-GCM encrypted, base64
  keyIv: string;            // Initialization vector, base64
  keyHint: string;          // Last 4 chars of plaintext key for display
  status: "valid" | "invalid" | "expired" | "unverified";
  lastValidatedAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

Encryption uses the existing `encryptField` / `decryptField` utilities in `packages/db`. The encryption key is stored in the environment variable `BYO_KEY_ENCRYPTION_SECRET` (separate from other secrets, rotatable independently).

**Keys are never returned in API responses.** The GET endpoint for user provider keys returns only `providerId`, `keyHint`, `status`, `lastValidatedAt`, `lastUsedAt`, and `createdAt`.

### Key Validation on Save

When a user saves a new BYO key, a lightweight validation call is made to the provider before storing:

```typescript
// Validation calls per provider:
google:       GET https://generativelanguage.googleapis.com/v1beta/models (list models)
elevenlabs:   GET https://api.elevenlabs.io/v1/user (get account info)
openai:       GET https://api.openai.com/v1/models (list models)
anthropic:    POST https://api.anthropic.com/v1/messages (1-token ping)
stability-ai: GET https://api.stability.ai/v1/user/account
```

Validation is done server-side (never from the browser — the key is never transmitted to the client after being entered). The flow:

```
User enters key in UI
        │
POST /api/settings/provider-keys (body: { providerId, key })
        │
Server: validate key with provider (timeout: 5s)
        │
  ┌─────┴─────┐
  ▼           ▼
valid       invalid / error
  │           │
encrypt     store with status: "invalid"
store       return 422 with error detail
status: "valid"
return 200 with { keyHint, status: "valid" }
```

Re-validation runs automatically every 7 days via a scheduled Convex action.

### ProviderAdapter Interface

```typescript
// packages/social-engine-core/src/providers/ProviderAdapter.ts

export interface ProviderAdapter {
  providerId: string;
  providerName: string;
  supportedOperations: OperationType[];   // "text" | "image" | "video" | "voice"

  validateKey(apiKey: string): Promise<KeyValidationResult>;

  generateText(
    params: TextGenerationParams,
    apiKey: string,
  ): Promise<GenerationResult>;

  generateImage(
    params: ImageGenerationParams,
    apiKey: string,
  ): Promise<GenerationResult>;

  generateVideo(
    params: VideoGenerationParams,
    apiKey: string,
  ): Promise<GenerationResult>;

  generateVoice(
    params: VoiceGenerationParams,
    apiKey: string,
  ): Promise<GenerationResult>;
}
```

Each provider implements only the operations it supports. Calling an unsupported operation throws `UnsupportedOperationError`. The adapter registry maps provider IDs to implementations:

```typescript
// packages/social-engine-core/src/providers/registry.ts
export const adapterRegistry: Record<string, ProviderAdapter> = {
  google:       new GoogleProviderAdapter(),
  elevenlabs:   new ElevenLabsProviderAdapter(),
  openai:       new OpenAIProviderAdapter(),
  anthropic:    new AnthropicProviderAdapter(),
  "stability-ai": new StabilityAIProviderAdapter(),
};
```

### Routing Logic

The generation service resolves the provider at request time:

```typescript
async function resolveProvider(
  userId: string,
  operationType: OperationType,
  modelId: string,
  preferBYO: boolean,
): Promise<{ adapter: ProviderAdapter; apiKey: string; isBYO: boolean }> {

  if (preferBYO) {
    const providerId = modelToProviderMap[modelId];
    const byoKey = await getUserProviderKey(userId, providerId);

    if (byoKey && byoKey.status === "valid") {
      const plainKey = decryptField(byoKey.encryptedKey, byoKey.keyIv);
      return { adapter: adapterRegistry[providerId], apiKey: plainKey, isBYO: true };
    }
    // BYO requested but key is invalid — return error rather than silently fallback
    throw new BYOKeyUnavailableError(providerId);
  }

  // Use Social Engine managed key (from env)
  const managedKey = getManagedProviderKey(modelId);
  return { adapter: adapterRegistry[getProviderForModel(modelId)], apiKey: managedKey, isBYO: false };
}
```

**Critical design decision**: If `preferBYO: true` but the key is invalid, the request fails with an explicit error rather than silently falling back to credits. This prevents unexpected credit deduction. The error message tells the user their BYO key failed and invites them to either fix it or regenerate with credits.

When `isBYO: true`, the credit deduction step is skipped entirely. A `creditTransactions` row is still written with `byoKey: true` and `creditsCharged: 0` for audit purposes.

### UI — Settings → API Keys

```
Settings
└── API Keys
    ├── Social Engine API Keys          (see PRD-api-billing.md)
    └── Provider Keys (BYO)
        ├── Google (Gemini / Veo / Imagen)  [Connected ✓ | last used 2h ago]
        ├── ElevenLabs                       [Not connected]
        ├── OpenAI                           [Invalid key ✗ | fix or remove]
        ├── Anthropic                        [Not connected]
        └── Stability AI                     [Not connected]
```

Each provider row has:
- Status badge: "Connected" (green) / "Not connected" (gray) / "Invalid" (red) / "Validating..." (spinner).
- Last used timestamp (if connected).
- Key hint display: `sk-...ab3f` (last 4 chars only).
- "Connect" button (opens key input sheet) or "Update" / "Remove" if already connected.

**Key input sheet**:
- Password-type input field (characters masked).
- Link to provider documentation for finding the key.
- "Validate & Save" button — shows spinner during server-side validation.
- Inline error if validation fails: "Invalid key. Check that this key has the required permissions and try again."

**Generation screen BYO toggle**:

When a user has a valid BYO key for the provider that powers the selected model, the generation screen shows a toggle:

```
[ Use included credits (3 credits)  |  Use my Google key (free) ]
```

The toggle state is persisted per-user per-provider in `localStorage` (remembers preference, not enforced server-side). The server always respects the `preferBYO` flag sent in the generation request.

### Security Controls

- Keys are encrypted with AES-256-GCM before database write. The encryption key is never stored in the database.
- The plaintext key is held in memory only during the validation call and the generation call. It is never logged.
- API responses for provider key management include only `keyHint` (last 4 chars) — never the full key or any intermediate representation.
- Removing a BYO key from Social Engine deletes the encrypted record from MongoDB. It does not revoke the key at the provider (the user must do that themselves — this is documented in the UI).
- The `BYO_KEY_ENCRYPTION_SECRET` env variable can be rotated by a re-encryption migration script (not part of V1, but the schema supports it via the `keyIv` field).

---

## Implementation Plan

### Phase 1 — Storage & Validation (Week 2)
- Define `UserProviderKey` MongoDB model.
- Implement encrypt/decrypt helpers using `packages/db` utils.
- Implement `POST /api/settings/provider-keys` (validate + store).
- Implement `GET /api/settings/provider-keys` (list with hints, no plaintext).
- Implement `DELETE /api/settings/provider-keys/:providerId`.
- Implement adapter registry with Google and ElevenLabs adapters (most needed for V1).

### Phase 2 — Routing & Credit Bypass (Week 3)
- Implement `resolveProvider()` routing logic in the generation service.
- Wire `preferBYO` flag through all generation API endpoints.
- Ensure `creditTransactions` audit log writes `byoKey: true` entries.
- Add OpenAI and Anthropic adapters.

### Phase 3 — UI (Week 4)
- Settings → Provider Keys section with status badges and key input sheet.
- BYO toggle on generation screens for users with valid keys.
- Stability AI adapter.
- Scheduled re-validation job (every 7 days).

---

## Acceptance Criteria

- [ ] A Pro user can connect a valid Google API key; status badge shows "Connected" within 5 seconds.
- [ ] An invalid key is rejected at save time with an HTTP 422 and a descriptive error; no key is stored.
- [ ] A connected key is never returned in any API response (only `keyHint` last 4 chars).
- [ ] Running a Veo 3 video generation with a valid Google BYO key deducts 0 credits and writes a `byoKey: true` audit log entry.
- [ ] Running the same operation with `preferBYO: false` deducts 5 credits normally.
- [ ] If `preferBYO: true` but the key has status "invalid", the request returns a descriptive error and does NOT fall back to credit deduction.
- [ ] Removing a BYO key deletes the encrypted record from the database.
- [ ] A Free or Starter user cannot access the Provider Keys settings section (gated by plan).
- [ ] The BYO toggle appears on the generation screen only when the user has a valid key for the relevant provider.
- [ ] The key re-validation job runs within 7 days of last validation; status badge updates if the key has been revoked at the provider.
- [ ] All BYO key operations are auditable via the `creditTransactions` log (byoKey=true entries).

---

## Open Questions

1. **Key sharing within Agency seats**: Should Agency admins be able to share a single BYO key across all seats, or is per-seat key management sufficient? Per-seat is simpler but requires each seat to have its own provider account.
2. **Automatic fallback opt-in**: Should there be an opt-in setting ("If my BYO key fails, fall back to included credits") rather than always failing hard? Opt-in fallback would be a user-controlled flag per provider.
3. **Stability AI adapter timeline**: Stability AI is lower priority than Google/ElevenLabs for V1. Can it slip to V2 if Phase 3 is under time pressure?
4. **Key encryption rotation**: When does the `BYO_KEY_ENCRYPTION_SECRET` rotation script need to be built? Pre-go-live or post-launch based on security review?
5. **Provider key analytics**: Should the admin usage dashboard show BYO vs. managed key split for operations? Useful for understanding how many users are using their own keys (affects margin calculation).

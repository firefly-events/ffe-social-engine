# Convex vs MongoDB Evaluation for Social Engine

> Research 2026-03-24. Comprehensive comparison for the Social Engine SaaS product.

## DECISION: Hybrid — Convex primary, MongoDB for encrypted tokens + analytics

### Schema Assignment

| Schema | Database | Why |
|--------|----------|-----|
| User | Convex | Real-time, simple CRUD, Clerk integration native |
| Content | Convex | Real-time generation progress, subscriptions |
| Session (branching) | Convex | OCC for concurrent edits, reactive updates |
| Feature Flag | Convex | Instant propagation on admin changes |
| Usage (counters) | Convex | OCC auto-retry for concurrent increments |
| Post (scheduling) | Convex | `scheduler.runAt()` replaces BullMQ entirely |
| Social Account (tokens) | **MongoDB** | Needs CSFLE/field-level encryption for OAuth tokens |
| Analytics aggregation | **MongoDB** | Complex `$group`/`$facet` pipelines, no execution limits |

### What Convex Eliminates from Our Stack
- API gateway (Express) → Convex server functions
- WebSocket infrastructure → Convex real-time subscriptions
- Job queue (BullMQ/Redis) → Convex scheduling
- Query caching → Convex automatic caching
- Possibly Turborepo → single Next.js + Convex project

### Convex Preview Deployments
- Each Vercel preview deploy gets isolated Convex backend
- Zero data leakage between PR reviews
- Set `CONVEX_DEPLOY_KEY` scoped to Preview environment in Vercel
- Fresh database per branch, auto-cleaned

### Convex + Clerk
- Native `<ConvexProviderWithClerk>` component
- JWT validation automatic, `ctx.auth.getUserIdentity()` in all functions
- Plan gating: store plan in Convex users table, check in functions

### Pricing Comparison

| Scale | Convex Pro | MongoDB Atlas |
|-------|-----------|---------------|
| 10K users | $60/mo | $57/mo (M10) |
| 50K users | $250/mo | $143/mo (M20) |
| 100K users | $600/mo | $388/mo (M30) |

Convex is comparable at low scale, more expensive at high scale due to per-function-call pricing ($2/1M calls).

### Convex Limitations
- 1-second execution limit for queries
- 32K document scan limit per transaction
- No field-level encryption
- No aggregation pipelines (all JS-based reduction)
- Per-function-call pricing scales with real-time subscription frequency

### Migration Effort
- 3-5 days for one developer
- Mongoose schemas map directly to Convex `defineTable`
- Query rewrites: `find()` → `.withIndex()`, `findOneAndUpdate()` → mutations
- Can coexist: Convex Actions call MongoDB for analytics/encrypted data

### Other Vercel Options Considered
- **Neon (Postgres)**: Good branching, no real-time. Alternative if we go SQL.
- **Vercel Edge Config**: Perfect for feature flags (sub-1ms global reads), but write-slow. Companion, not replacement.
- **Vercel Blob**: Better CDN economics for large video files than Convex file storage at scale.
- **PlanetScale**: Eliminated free tier, $39/mo minimum. Not recommended.

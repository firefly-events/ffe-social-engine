/**
 * @ffe/db — Database Package
 *
 * The Social Engine uses Convex as its primary database.
 * Convex schema, mutations, and queries are located in:
 *   apps/dashboard/convex/
 *
 * Key files:
 *   - schema.ts       — data model (users, posts, socialAccounts, analytics)
 *   - users.ts        — user CRUD + Clerk sync mutations
 *   - authHelpers.ts  — auth utility functions
 *   - auth.config.ts  — Clerk JWT configuration
 *   - http.ts         — HTTP endpoints (Clerk/Stripe webhooks)
 *
 * Convex deployment: calm-gnat-491
 * Site URL: https://calm-gnat-491.convex.site
 */
module.exports = {};

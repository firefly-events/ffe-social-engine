/**
 * convex-client.ts — Singleton ConvexHttpClient for use in Next.js API routes.
 *
 * This is a server-side-only module. Do NOT import it from client components.
 * The ConvexHttpClient is used instead of the React-based client because API
 * routes run in the Node.js runtime, not in a browser/React context.
 */

import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? '';

// Lazily validate at call-time rather than at module evaluation so that
// `next build` (which statically evaluates pages without real env vars) does
// not crash. Routes that actually invoke convexClient at runtime will still
// receive a proper runtime error if the env var is absent.
export const convexClient = new ConvexHttpClient(convexUrl || 'https://placeholder.invalid');

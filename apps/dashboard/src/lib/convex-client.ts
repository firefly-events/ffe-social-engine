/**
 * convex-client.ts — Singleton ConvexHttpClient for use in Next.js API routes.
 *
 * This is a server-side-only module. Do NOT import it from client components.
 * The ConvexHttpClient is used instead of the React-based client because API
 * routes run in the Node.js runtime, not in a browser/React context.
 */

import { ConvexHttpClient } from "convex/browser";

// Use a placeholder URL during build time; the real URL is required at runtime.
// Throwing at module load time breaks Next.js static page data collection.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";

export const convexClient = new ConvexHttpClient(convexUrl);

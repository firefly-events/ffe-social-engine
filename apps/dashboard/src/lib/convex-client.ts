/**
 * convex-client.ts — Singleton ConvexHttpClient for use in Next.js API routes.
 *
 * This is a server-side-only module. Do NOT import it from client components.
 * The ConvexHttpClient is used instead of the React-based client because API
 * routes run in the Node.js runtime, not in a browser/React context.
 */

import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your .secrets/.env file."
  );
}

export const convexClient = new ConvexHttpClient(convexUrl);

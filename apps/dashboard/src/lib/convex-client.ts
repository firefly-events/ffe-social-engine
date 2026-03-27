/**
 * convex-client.ts — Singleton ConvexHttpClient for use in Next.js API routes.
 *
 * This is a server-side-only module. Do NOT import it from client components.
 * The ConvexHttpClient is used instead of the React-based client because API
 * routes run in the Node.js runtime, not in a browser/React context.
 */

import { ConvexHttpClient } from "convex/browser";

function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Add it to your .secrets/.env file."
    );
  }
  return new ConvexHttpClient(convexUrl);
}

// Lazily-initialised singleton — the error is thrown at call time, not at
// module-evaluation time, so Next.js can still collect static page data during
// builds where the env var is absent.
let _client: ConvexHttpClient | undefined;

export const convexClient: ConvexHttpClient = new Proxy({} as ConvexHttpClient, {
  get(_target, prop, receiver) {
    if (!_client) {
      _client = getConvexClient();
    }
    const value = (_client as any)[prop];
    if (typeof value === "function") {
      return value.bind(_client);
    }
    return value;
  },
});

/**
 * POST /api/auth/[provider]/disconnect
 *
 * Removes a connected social account from Convex for the currently
 * authenticated user. Does NOT revoke the token at the provider — callers
 * should handle provider-side revocation separately if required.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { isOAuthProvider } from "../../../../../lib/oauth/providers";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
): Promise<NextResponse> {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return new NextResponse(
      JSON.stringify({ error: `Unknown provider: ${provider}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // userId is derived from ctx.auth inside the mutation — no need to pass it
    await fetchMutation(api.socialAccounts.deleteSocialAccount, {
      platform: provider,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to disconnect account";
    console.error(`[Disconnect] ${provider} error:`, err);
    return new NextResponse(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

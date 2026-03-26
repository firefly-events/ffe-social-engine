/**
 * GET /api/auth/[provider]/callback
 *
 * OAuth 2.0 callback handler. Called by the provider after the user authorizes.
 *
 * Steps:
 * 1. Validate the `state` param against the cookie (CSRF guard).
 * 2. Exchange the `code` for tokens at the provider's token endpoint.
 * 3. Fetch the user's profile (handle / display name) from the provider API.
 * 4. Encrypt the access_token (and refresh_token if present) with AES-256-GCM.
 * 5. Upsert the record in Convex `socialAccounts`.
 * 6. Fire a PostHog `social_oauth_connected` event.
 * 7. Redirect to /connect?connected=<platform>.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { encrypt } from "../../../../../lib/crypto";
import { providers, isOAuthProvider } from "../../../../../lib/oauth/providers";
import { getPostHogServer } from "../../../../../lib/posthog-server";

const FETCH_TIMEOUT_MS = 10_000; // 10 seconds

/** Returns the per-provider state cookie name (matches the initiation route) */
function stateCookieName(provider: string): string {
  return `oauth_state_${provider}`;
}

/** Returns the per-provider PKCE verifier cookie name (matches the initiation route) */
function pkceCookieName(provider: string): string {
  return `oauth_pkce_verifier_${provider}`;
}

const isProduction = process.env.NODE_ENV === "production";
const securePart = isProduction ? "; Secure" : "";

// Cookie clearing helper — expires immediately
function clearCookie(name: string): string {
  return `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${securePart}`;
}

// ─── Fetch with timeout ───────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string | URL,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url.toString(), { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Token exchange ───────────────────────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type: string;
}

async function exchangeCodeForTokens(
  provider: string,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<TokenResponse> {
  const config = providers[provider as keyof typeof providers];

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  // TikTok requires client_key (not client_id) in the token exchange body
  if (provider === "tiktok") {
    body.set("client_key", config.clientId);
    body.set("client_secret", config.clientSecret);
  } else if (provider === "instagram") {
    // Instagram uses client_id + client_secret in the body
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
  } else {
    // Standard: client_id in body (Basic Auth used for secret)
    body.set("client_id", config.clientId);
  }

  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  // Standard confidential-client Basic Auth for non-form-secret providers
  if (provider !== "instagram" && provider !== "tiktok") {
    const credentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  const res = await fetchWithTimeout(config.tokenUrl, {
    method: "POST",
    headers,
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed for ${provider}: ${res.status} ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

// ─── Profile fetchers ─────────────────────────────────────────────────────────

interface UserProfile {
  platformUserId: string;
  handle: string;
}

async function fetchLinkedInProfile(accessToken: string): Promise<UserProfile> {
  const res = await fetchWithTimeout("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`LinkedIn userinfo failed: ${res.status}`);
  const data = (await res.json()) as { sub: string; name?: string; email?: string };
  return {
    platformUserId: data.sub,
    handle: data.name ?? data.email ?? data.sub,
  };
}

async function fetchTwitterProfile(accessToken: string): Promise<UserProfile> {
  const res = await fetchWithTimeout("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Twitter users/me failed: ${res.status}`);
  const data = (await res.json()) as { data: { id: string; username: string } };
  return {
    platformUserId: data.data.id,
    handle: `@${data.data.username}`,
  };
}

async function fetchInstagramProfile(accessToken: string): Promise<UserProfile> {
  const url = new URL("https://graph.instagram.com/me");
  url.searchParams.set("fields", "id,username");
  url.searchParams.set("access_token", accessToken);

  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Instagram /me failed: ${res.status}`);
  const data = (await res.json()) as { id: string; username: string };
  return {
    platformUserId: data.id,
    handle: `@${data.username}`,
  };
}

async function fetchTikTokProfile(accessToken: string): Promise<UserProfile> {
  const url = new URL("https://open.tiktokapis.com/v2/user/info/");
  url.searchParams.set("fields", "open_id,display_name");

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`TikTok user/info failed: ${res.status}`);
  const data = (await res.json()) as {
    data: { user: { open_id: string; display_name: string } };
  };
  return {
    platformUserId: data.data.user.open_id,
    handle: data.data.user.display_name,
  };
}

async function fetchYouTubeProfile(accessToken: string): Promise<UserProfile> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("mine", "true");

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`YouTube channels failed: ${res.status}`);
  const data = (await res.json()) as {
    items: Array<{ id: string; snippet: { customUrl?: string; title: string } }>;
  };

  const channel = data.items?.[0];
  if (!channel) throw new Error("YouTube: no channel found for this account");

  return {
    platformUserId: channel.id,
    handle: channel.snippet.customUrl ?? channel.snippet.title,
  };
}

async function fetchUserProfile(
  provider: string,
  accessToken: string
): Promise<UserProfile> {
  switch (provider) {
    case "linkedin":
      return fetchLinkedInProfile(accessToken);
    case "twitter":
      return fetchTwitterProfile(accessToken);
    case "instagram":
      return fetchInstagramProfile(accessToken);
    case "tiktok":
      return fetchTikTokProfile(accessToken);
    case "youtube":
      return fetchYouTubeProfile(accessToken);
    default:
      throw new Error(`No profile fetcher for provider: ${provider}`);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
): Promise<NextResponse> {
  const { provider } = await params;

  if (!isOAuthProvider(provider)) {
    return new NextResponse(
      JSON.stringify({ error: `Unknown provider: ${provider}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  // Provider denied or user cancelled
  if (errorParam) {
    const errorDesc = url.searchParams.get("error_description") ?? errorParam;
    console.error(`[OAuth callback] ${provider} returned error: ${errorDesc}`);
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent(errorDesc)}`, url.origin),
      302
    );
  }

  if (!code || !stateParam) {
    return new NextResponse(
      JSON.stringify({ error: "Missing code or state parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse cookies from the request
  const cookieHeader = req.headers.get("cookie") ?? "";
  const parseCookie = (name: string): string | undefined => {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  // Use per-provider cookie names (matching the initiation route)
  const stateCookie = parseCookie(stateCookieName(provider));
  const pkceCookie = parseCookie(pkceCookieName(provider));

  // CSRF validation
  if (!stateCookie || stateCookie !== stateParam) {
    console.error("[OAuth callback] State mismatch — possible CSRF");
    return new NextResponse(
      JSON.stringify({ error: "State mismatch — request may have been tampered with" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Clerk auth — we need the userId to store the account
  const { userId, getToken } = await auth();
  if (!userId) {
    // User is not logged into our app; redirect to sign-in and come back
    return NextResponse.redirect(
      new URL(
        `/sign-in?redirect_url=${encodeURIComponent(`/api/auth/${provider}/callback?${url.searchParams.toString()}`)}`,
        url.origin
      ),
      302
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const redirectUri = `${appUrl}/api/auth/${provider}/callback`;

  try {
    // 1. Exchange code for tokens
    const tokens = await exchangeCodeForTokens(
      provider,
      code,
      redirectUri,
      pkceCookie // undefined for non-PKCE providers
    );

    // 2. Fetch user profile
    const profile = await fetchUserProfile(provider, tokens.access_token);

    // 3. Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : undefined;

    const tokenExpiresAt = tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined;

    const scopes = tokens.scope
      ? tokens.scope.split(/[\s,]+/).filter(Boolean)
      : providers[provider].scopes;

    // 4. Upsert in Convex — userId is derived from ctx.auth in the mutation
    const convexToken = await getToken({ template: "convex" });
    await fetchMutation(api.socialAccounts.upsertSocialAccount, {
      platform: provider,
      handle: profile.handle,
      platformUserId: profile.platformUserId,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      scopes,
    }, { token: convexToken ?? undefined });

    // 5. PostHog event
    try {
      const ph = getPostHogServer();
      ph.capture({
        distinctId: userId,
        event: "social_oauth_connected",
        properties: {
          platform: provider,
          handle: profile.handle,
        },
      });
    } catch (phErr) {
      // Non-fatal: log but don't fail the connection
      console.warn("[OAuth callback] PostHog capture failed:", phErr);
    }

    // 6. Redirect to connect page with success indicator
    const redirectResponse = NextResponse.redirect(
      new URL(`/connect?connected=${provider}`, url.origin),
      302
    );

    // Clear the state and PKCE cookies
    redirectResponse.headers.append("Set-Cookie", clearCookie(stateCookieName(provider)));
    if (pkceCookie) {
      redirectResponse.headers.append("Set-Cookie", clearCookie(pkceCookieName(provider)));
    }

    return redirectResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth callback failed";
    console.error(`[OAuth callback] ${provider} error:`, err);

    const errorResponse = NextResponse.redirect(
      new URL(
        `/connect?error=${encodeURIComponent(`Failed to connect ${providers[provider].name}: ${message}`)}`,
        url.origin
      ),
      302
    );
    errorResponse.headers.append("Set-Cookie", clearCookie(stateCookieName(provider)));
    errorResponse.headers.append("Set-Cookie", clearCookie(pkceCookieName(provider)));
    return errorResponse;
  }
}

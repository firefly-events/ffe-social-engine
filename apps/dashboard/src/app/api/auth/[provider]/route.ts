/**
 * GET /api/auth/[provider]
 *
 * Initiates the OAuth 2.0 authorization flow for the given social platform.
 *
 * Steps:
 * 1. Validate the provider name.
 * 2. Generate a cryptographically random state parameter and store it in a
 *    short-lived httpOnly cookie to guard against CSRF.
 * 3. For Twitter (PKCE): generate a code_verifier, derive code_challenge via
 *    SHA-256, and store the verifier in a separate httpOnly cookie.
 * 4. Build the provider's authorization URL and redirect the user there.
 */

import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import { providers, isOAuthProvider } from "../../../../lib/oauth/providers";

const STATE_COOKIE = "oauth_state";
const PKCE_COOKIE = "oauth_pkce_verifier";
const COOKIE_MAX_AGE = 600; // 10 minutes

export async function GET(
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

  const config = providers[provider];

  if (!config.clientId) {
    return new NextResponse(
      JSON.stringify({ error: `Provider ${provider} is not configured (missing clientId).` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/${provider}/callback`;

  // --- State (CSRF protection) ---
  const state = randomBytes(32).toString("hex");

  const cookieBase = `; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
  const cookies: string[] = [
    `${STATE_COOKIE}=${state}${cookieBase}`,
  ];

  // --- Build authorization URL ---
  const authParams = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  // --- PKCE for Twitter ---
  if (config.usePKCE) {
    // code_verifier: 64 random bytes as base64url (RFC 7636 §4.1)
    const codeVerifier = randomBytes(64).toString("base64url");

    // code_challenge = BASE64URL(SHA256(ASCII(code_verifier)))
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    authParams.set("code_challenge", codeChallenge);
    authParams.set("code_challenge_method", "S256");

    cookies.push(`${PKCE_COOKIE}=${codeVerifier}${cookieBase}`);
  }

  const authorizationUrl = `${config.authorizationUrl}?${authParams.toString()}`;

  const response = NextResponse.redirect(authorizationUrl, 302);

  // Set cookies on the redirect response
  for (const cookie of cookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}

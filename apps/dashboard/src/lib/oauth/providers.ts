/**
 * OAuth provider configurations for all supported social platforms.
 *
 * Client credentials are read from environment variables at runtime.
 * GCP Secret Manager naming follows: social-engine-{env}-{platform}-{field}
 */

export type OAuthProvider =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "tiktok"
  | "youtube";

export interface ProviderConfig {
  /** Display name shown in UI / logs */
  name: string;
  clientId: string;
  clientSecret: string;
  /** Authorization endpoint (redirect user here) */
  authorizationUrl: string;
  /** Token exchange endpoint (server-side) */
  tokenUrl: string;
  /** OAuth scopes to request */
  scopes: string[];
  /**
   * Twitter/X requires PKCE (Proof Key for Code Exchange) because its
   * OAuth 2.0 implementation is public-client style even for confidential apps.
   */
  usePKCE?: boolean;
}

export const providers: Record<OAuthProvider, ProviderConfig> = {
  linkedin: {
    name: "LinkedIn",
    clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
    authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    // openid + profile + email = OIDC userinfo; w_member_social = posting
    scopes: ["openid", "profile", "email", "w_member_social"],
  },

  twitter: {
    name: "Twitter / X",
    clientId: process.env.TWITTER_CLIENT_ID ?? "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
    authorizationUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    usePKCE: true,
  },

  instagram: {
    name: "Instagram",
    clientId: process.env.INSTAGRAM_APP_ID ?? "",
    clientSecret: process.env.INSTAGRAM_APP_SECRET ?? "",
    authorizationUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish"],
  },

  tiktok: {
    name: "TikTok",
    clientId: process.env.TIKTOK_CLIENT_KEY ?? "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
    authorizationUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: ["user.info.basic", "video.upload", "video.publish"],
  },

  youtube: {
    name: "YouTube",
    clientId: process.env.YOUTUBE_CLIENT_ID ?? "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.upload",
    ],
  },
};

/** Type-guard: returns true if the string is a valid OAuthProvider key */
export function isOAuthProvider(value: string): value is OAuthProvider {
  return Object.keys(providers).includes(value);
}

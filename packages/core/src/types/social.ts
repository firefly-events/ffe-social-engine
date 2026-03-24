import type { Platform } from './content.js';

export { Platform };

export enum SocialAccountStatus {
  Connected = 'connected',
  Expired = 'expired',
  Revoked = 'revoked',
  Error = 'error',
}

/**
 * OAuth tokens are stored encrypted in the database.
 * This interface represents the decrypted in-memory form.
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  /** UNIX timestamp (seconds) when accessToken expires */
  expiresAt?: number;
  /** Raw scope string returned by the provider */
  scope?: string;
  /** Provider-specific extra fields (e.g. id_token) */
  extras?: Record<string, unknown>;
}

export interface SocialProfile {
  /** Provider's user/channel ID */
  externalId: string;
  username?: string;
  displayName?: string;
  profileImageUrl?: string;
  profileUrl?: string;
  followerCount?: number;
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: Platform;
  status: SocialAccountStatus;
  profile: SocialProfile;
  /** Encrypted at rest; only decrypted when making API calls */
  tokens: OAuthTokens;
  /**
   * If this account is linked to a Zernio social set,
   * store the reference here.
   */
  zernioSocialSetId?: string;
  lastRefreshedAt?: Date;
  connectedAt: Date;
  updatedAt: Date;
}

export interface PostResult {
  success: boolean;
  platform: Platform;
  /** Provider's post/media ID */
  externalPostId?: string;
  /** Public URL of the published post */
  postUrl?: string;
  publishedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
}

export interface AnalyticsSnapshot {
  capturedAt: Date;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  videoViews?: number;
  /** Platform-specific raw metrics */
  raw?: Record<string, unknown>;
}

export type CreateSocialAccountInput = Pick<
  SocialAccount,
  'userId' | 'platform' | 'profile' | 'tokens'
> &
  Partial<Pick<SocialAccount, 'zernioSocialSetId'>>;

/**
 * Social account schema with application-level AES-256-GCM encryption
 * for OAuth tokens. Tokens are encrypted before save and decrypted
 * after fetch via Mongoose middleware.
 */
import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { Platform, SocialAccountStatus } from '@ffe/core';
import { encrypt, decrypt } from '../encryption.js';

// ─── Interfaces ───────────────────────────────────────────────────────────────

/**
 * Raw tokens as stored in MongoDB (fields are encrypted strings).
 */
export interface TokensEncrypted {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: number;
  scope?: string;
  extras?: Map<string, unknown>;
}

export interface SocialProfileDocument {
  externalId: string;
  username?: string;
  displayName?: string;
  profileImageUrl?: string;
  profileUrl?: string;
  followerCount?: number;
}

export interface SocialAccountDocument extends Document {
  userId: Types.ObjectId;
  platform: Platform;
  status: SocialAccountStatus;
  profile: SocialProfileDocument;
  /** Stored encrypted; middleware handles encrypt/decrypt transparently */
  tokens: TokensEncrypted;
  zernioSocialSetId?: string;
  lastRefreshedAt?: Date;
  connectedAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const profileSchema = new Schema<SocialProfileDocument>(
  {
    externalId: { type: String, required: true },
    username: String,
    displayName: String,
    profileImageUrl: String,
    profileUrl: String,
    followerCount: { type: Number, min: 0 },
  },
  { _id: false },
);

const tokensSchema = new Schema<TokensEncrypted>(
  {
    accessToken: { type: String, required: true },
    refreshToken: String,
    tokenType: String,
    expiresAt: Number,
    scope: String,
    extras: { type: Map, of: Schema.Types.Mixed },
  },
  { _id: false },
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const socialAccountSchema = new Schema<SocialAccountDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: {
      type: String,
      enum: Object.values(Platform),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SocialAccountStatus),
      default: SocialAccountStatus.Connected,
      required: true,
    },
    profile: { type: profileSchema, required: true },
    tokens: { type: tokensSchema, required: true },
    zernioSocialSetId: { type: String, sparse: true },
    lastRefreshedAt: Date,
    connectedAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'social_accounts',
  },
);

// One account per user+platform
socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });
socialAccountSchema.index({ userId: 1, status: 1 });
socialAccountSchema.index({ zernioSocialSetId: 1 }, { sparse: true });

// ─── Encryption middleware ────────────────────────────────────────────────────

/** Encrypt tokens before inserting a new document */
socialAccountSchema.pre('save', function (next) {
  if (this.isModified('tokens.accessToken') && this.tokens.accessToken) {
    this.tokens.accessToken = encrypt(this.tokens.accessToken);
  }
  if (this.isModified('tokens.refreshToken') && this.tokens.refreshToken) {
    this.tokens.refreshToken = encrypt(this.tokens.refreshToken);
  }
  next();
});

/** Encrypt tokens before findOneAndUpdate / updateOne / updateMany */
function encryptTokensInUpdate(
  this: { getUpdate(): Record<string, unknown> | null },
  next: () => void,
) {
  const update = this.getUpdate() as Record<string, unknown> | null;
  if (!update) return next();

  const setOp = update['$set'] as Record<string, string> | undefined;
  if (setOp) {
    if (setOp['tokens.accessToken']) {
      setOp['tokens.accessToken'] = encrypt(setOp['tokens.accessToken']);
    }
    if (setOp['tokens.refreshToken']) {
      setOp['tokens.refreshToken'] = encrypt(setOp['tokens.refreshToken']);
    }
  }
  next();
}

socialAccountSchema.pre('findOneAndUpdate', encryptTokensInUpdate);
socialAccountSchema.pre('updateOne', encryptTokensInUpdate);
socialAccountSchema.pre('updateMany', encryptTokensInUpdate);

/** Decrypt tokens after any find operation */
function decryptTokensAfterFind(doc: SocialAccountDocument | null) {
  if (!doc?.tokens) return;
  if (doc.tokens.accessToken) {
    doc.tokens.accessToken = decrypt(doc.tokens.accessToken);
  }
  if (doc.tokens.refreshToken) {
    doc.tokens.refreshToken = decrypt(doc.tokens.refreshToken);
  }
}

socialAccountSchema.post('find', function (docs: SocialAccountDocument[]) {
  docs.forEach(decryptTokensAfterFind);
});
socialAccountSchema.post('findOne', decryptTokensAfterFind);
socialAccountSchema.post('findOneAndUpdate', decryptTokensAfterFind);
socialAccountSchema.post('save', decryptTokensAfterFind);

export const SocialAccountModel: Model<SocialAccountDocument> = model<SocialAccountDocument>(
  'SocialAccount',
  socialAccountSchema,
);

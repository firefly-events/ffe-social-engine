import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { Platform } from '@ffe/core';

export enum PostStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Publishing = 'publishing',
  Published = 'published',
  Failed = 'failed',
  Canceled = 'canceled',
}

export interface AnalyticsSnapshotDocument {
  capturedAt: Date;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  videoViews?: number;
  raw?: Map<string, unknown>;
}

export interface PostDocument extends Document {
  userId: Types.ObjectId;
  contentId: Types.ObjectId;
  /** The specific variant ObjectId within the ContentDocument */
  variantId?: Types.ObjectId;
  platform: Platform;
  /** Social account used for publishing */
  socialAccountId: Types.ObjectId;
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  /** Provider's post/media ID returned after publishing */
  externalPostId?: string;
  /** Public URL of the published post */
  postUrl?: string;
  /** Zernio scheduler post ID (if dispatched via Zernio) */
  zernioPostId?: string;
  errorCode?: string;
  errorMessage?: string;
  /** Analytics snapshots captured over time */
  analyticsSnapshots: AnalyticsSnapshotDocument[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const analyticsSnapshotSchema = new Schema<AnalyticsSnapshotDocument>(
  {
    capturedAt: { type: Date, required: true },
    impressions: Number,
    reach: Number,
    likes: Number,
    comments: Number,
    shares: Number,
    saves: Number,
    clicks: Number,
    videoViews: Number,
    raw: { type: Map, of: Schema.Types.Mixed },
  },
  { _id: false },
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const postSchema = new Schema<PostDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
    variantId: { type: Schema.Types.ObjectId },
    platform: {
      type: String,
      enum: Object.values(Platform),
      required: true,
    },
    socialAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'SocialAccount',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.Draft,
      required: true,
    },
    scheduledAt: Date,
    publishedAt: Date,
    externalPostId: String,
    postUrl: String,
    zernioPostId: { type: String, sparse: true },
    errorCode: String,
    errorMessage: String,
    analyticsSnapshots: { type: [analyticsSnapshotSchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'posts',
  },
);

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ userId: 1, status: 1, scheduledAt: 1 });
postSchema.index({ contentId: 1 });
postSchema.index({ scheduledAt: 1, status: 1 }); // For scheduler sweep
postSchema.index({ zernioPostId: 1 }, { sparse: true });

export const PostModel: Model<PostDocument> = model<PostDocument>('Post', postSchema);

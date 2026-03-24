import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { Platform, ContentType, ContentStatus } from '@ffe/core';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface ContentVariantDocument {
  _id: Types.ObjectId;
  platform: Platform;
  text?: string;
  assetUrl?: string;
  audioUrl?: string;
  durationSeconds?: number;
  metadata: Map<string, unknown>;
  createdAt: Date;
}

export interface GenerationParamsDocument {
  prompt: string;
  tone?: string;
  style?: string;
  targetPlatforms: Platform[];
  aiModel: string;
  temperature?: number;
  modelParams?: Map<string, unknown>;
}

export interface ContentDocument extends Document {
  userId: Types.ObjectId;
  type: ContentType;
  status: ContentStatus;
  sourcePrompt: string;
  generationParams: GenerationParamsDocument;
  variants: ContentVariantDocument[];
  sessionId?: Types.ObjectId;
  sessionNodeId?: string;
  isCached: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const generationParamsSchema = new Schema<GenerationParamsDocument>(
  {
    prompt: { type: String, required: true },
    tone: String,
    style: String,
    targetPlatforms: [{ type: String, enum: Object.values(Platform) }],
    aiModel: { type: String, required: true },
    temperature: { type: Number, min: 0, max: 2 },
    modelParams: { type: Map, of: Schema.Types.Mixed },
  },
  { _id: false },
);

const variantSchema = new Schema<ContentVariantDocument>(
  {
    platform: { type: String, enum: Object.values(Platform), required: true },
    text: String,
    assetUrl: String,
    audioUrl: String,
    durationSeconds: { type: Number, min: 0 },
    metadata: { type: Map, of: Schema.Types.Mixed, default: () => new Map() },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const contentSchema = new Schema<ContentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: Object.values(ContentType), required: true },
    status: {
      type: String,
      enum: Object.values(ContentStatus),
      default: ContentStatus.Draft,
      required: true,
    },
    sourcePrompt: { type: String, required: true },
    generationParams: { type: generationParamsSchema, required: true },
    variants: [variantSchema],
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    sessionNodeId: String,
    isCached: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  {
    timestamps: true,
    collection: 'content_items',
  },
);

contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, type: 1, status: 1 });
contentSchema.index({ userId: 1, tags: 1 });
contentSchema.index({ sessionId: 1 }, { sparse: true });
contentSchema.index({ isCached: 1, userId: 1 });

export const ContentModel: Model<ContentDocument> = model<ContentDocument>('Content', contentSchema);

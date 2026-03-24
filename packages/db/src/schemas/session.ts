import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { SessionStatus, NodeStatus } from '@ffe/core';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface SessionNodeDocument {
  _id: Types.ObjectId;
  parentNodeId: Types.ObjectId | null;
  depth: number;
  label?: string;
  status: NodeStatus;
  generationParams: {
    prompt: string;
    tone?: string;
    style?: string;
    targetPlatforms: string[];
    aiModel: string;
    temperature?: number;
    modelParams?: Map<string, unknown>;
  };
  input: {
    prompt: string;
    contextFromParent?: unknown;
    userEdits?: string;
  };
  output?: {
    text?: string;
    assetUrl?: string;
    contentItemId?: Types.ObjectId;
    rawResponse?: unknown;
    tokensUsed?: number;
  };
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface SessionDocument extends Document {
  userId: Types.ObjectId;
  title?: string;
  status: SessionStatus;
  parentSessionId?: Types.ObjectId;
  forkFromNodeId?: Types.ObjectId;
  nodes: SessionNodeDocument[];
  /**
   * Cached node outputs keyed by node ObjectId (as string).
   * Stored as a Map for O(1) lookup.
   */
  cachedResults: Map<string, Record<string, unknown>>;
  targetPlatforms: string[];
  metadata: Map<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const generationParamsSubSchema = new Schema(
  {
    prompt: { type: String, required: true },
    tone: String,
    style: String,
    targetPlatforms: [String],
    aiModel: { type: String, required: true },
    temperature: { type: Number, min: 0, max: 2 },
    modelParams: { type: Map, of: Schema.Types.Mixed },
  },
  { _id: false },
);

const nodeOutputSubSchema = new Schema(
  {
    text: String,
    assetUrl: String,
    contentItemId: { type: Schema.Types.ObjectId, ref: 'Content' },
    rawResponse: Schema.Types.Mixed,
    tokensUsed: { type: Number, min: 0 },
  },
  { _id: false },
);

const nodeSchema = new Schema<SessionNodeDocument>(
  {
    parentNodeId: { type: Schema.Types.ObjectId, default: null },
    depth: { type: Number, required: true, min: 0, default: 0 },
    label: String,
    status: {
      type: String,
      enum: Object.values(NodeStatus),
      default: NodeStatus.Pending,
      required: true,
    },
    generationParams: { type: generationParamsSubSchema, required: true },
    input: {
      prompt: { type: String, required: true },
      contextFromParent: Schema.Types.Mixed,
      userEdits: String,
    },
    output: nodeOutputSubSchema,
    errorMessage: String,
    startedAt: Date,
    completedAt: Date,
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true },
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.Active,
      required: true,
    },
    parentSessionId: { type: Schema.Types.ObjectId, ref: 'Session', sparse: true },
    forkFromNodeId: { type: Schema.Types.ObjectId },
    nodes: [nodeSchema],
    cachedResults: { type: Map, of: Schema.Types.Mixed, default: () => new Map() },
    targetPlatforms: [{ type: String }],
    metadata: { type: Map, of: Schema.Types.Mixed, default: () => new Map() },
  },
  {
    timestamps: true,
    collection: 'sessions',
  },
);

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ parentSessionId: 1 }, { sparse: true });

export const SessionModel: Model<SessionDocument> = model<SessionDocument>('Session', sessionSchema);

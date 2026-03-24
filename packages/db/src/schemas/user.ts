import { Schema, model, type Document, type Model } from 'mongoose';
import { Plan } from '@ffe/core';

export interface UserDocument extends Document {
  clerkId: string;
  email: string;
  name?: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  /** Per-user feature flag overrides: { [flagName]: boolean } */
  features: Map<string, boolean>;
  /** Aggregated usage counters for the current billing period */
  usage: {
    captionsUsed: number;
    videosUsed: number;
    postsUsed: number;
    voiceClonesUsed: number;
    periodStart: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const usageSchema = new Schema(
  {
    captionsUsed: { type: Number, default: 0, min: 0 },
    videosUsed: { type: Number, default: 0, min: 0 },
    postsUsed: { type: Number, default: 0, min: 0 },
    voiceClonesUsed: { type: Number, default: 0, min: 0 },
    periodStart: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const userSchema = new Schema<UserDocument>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    plan: {
      type: String,
      enum: Object.values(Plan),
      default: Plan.Free,
      required: true,
    },
    stripeCustomerId: { type: String, sparse: true, unique: true },
    stripeSubscriptionId: { type: String, sparse: true, unique: true },
    currentPeriodEnd: { type: Date },
    features: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
    usage: { type: usageSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

// Additional indexes
userSchema.index({ plan: 1, createdAt: -1 });
userSchema.index({ stripeCustomerId: 1 }, { sparse: true });

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);

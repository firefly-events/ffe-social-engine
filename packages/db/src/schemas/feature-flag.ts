import { Schema, model, type Document, type Model } from 'mongoose';
import { Plan } from '@ffe/core';

export interface FeatureFlagDocument extends Document {
  name: string;
  description?: string;
  /** Global default — lowest precedence */
  enabledByDefault: boolean;
  /**
   * Per-plan overrides. Key is the Plan enum value.
   * A plan key here overrides the global default for all users on that plan.
   */
  planOverrides: Map<string, boolean>;
  /**
   * Per-user overrides. Key is User ObjectId as string.
   * Highest precedence — overrides both global default and plan override.
   */
  userOverrides: Map<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<FeatureFlagDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Enforce slug-style names (e.g. "voice-cloning", "bulk-scheduling")
      match: /^[a-z0-9-_]+$/,
    },
    description: String,
    enabledByDefault: { type: Boolean, default: false, required: true },
    planOverrides: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
      validate: {
        validator(map: Map<string, boolean>) {
          const validPlans = new Set(Object.values(Plan) as string[]);
          for (const key of map.keys()) {
            if (!validPlans.has(key)) return false;
          }
          return true;
        },
        message: 'planOverrides keys must be valid Plan enum values',
      },
    },
    userOverrides: {
      type: Map,
      of: Boolean,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
    collection: 'feature_flags',
  },
);

featureFlagSchema.index({ name: 1 }, { unique: true });

/**
 * Resolve the effective value of a feature flag for a given user.
 *
 * Resolution order (highest → lowest precedence):
 *   1. Per-user override
 *   2. Per-plan override
 *   3. Global default
 */
featureFlagSchema.methods['resolveFor'] = function (
  userId: string,
  plan: Plan,
): boolean {
  const doc = this as FeatureFlagDocument;

  // 1. Per-user override
  if (doc.userOverrides.has(userId)) {
    return doc.userOverrides.get(userId)!;
  }

  // 2. Per-plan override
  if (doc.planOverrides.has(plan)) {
    return doc.planOverrides.get(plan)!;
  }

  // 3. Global default
  return doc.enabledByDefault;
};

export const FeatureFlagModel: Model<FeatureFlagDocument> = model<FeatureFlagDocument>(
  'FeatureFlag',
  featureFlagSchema,
);

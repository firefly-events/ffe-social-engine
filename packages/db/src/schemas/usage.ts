import { Schema, model, type Document, type Model, Types } from 'mongoose';

export interface UsageDocument extends Document {
  userId: Types.ObjectId;
  /**
   * Billing month in ISO format: "YYYY-MM" (e.g. "2026-03").
   * Combined with userId forms a unique compound key.
   */
  month: string;
  captionsUsed: number;
  videosUsed: number;
  postsUsed: number;
  voiceClonesUsed: number;
  /** When this month's counters were last reset (or first created) */
  periodStart: Date;
  /** Scheduled reset date (typically first of next month, UTC midnight) */
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const usageSchema = new Schema<UsageDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(?:0[1-9]|1[0-2])$/,
    },
    captionsUsed: { type: Number, default: 0, min: 0 },
    videosUsed: { type: Number, default: 0, min: 0 },
    postsUsed: { type: Number, default: 0, min: 0 },
    voiceClonesUsed: { type: Number, default: 0, min: 0 },
    periodStart: { type: Date, required: true },
    resetAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: 'usage',
  },
);

// Primary lookup key
usageSchema.index({ userId: 1, month: 1 }, { unique: true });
// For finding all users whose usage resets soon (batch reset job)
usageSchema.index({ resetAt: 1 });

/**
 * Factory: create or return the usage document for a given user + month.
 * Uses findOneAndUpdate with upsert so it's safe to call concurrently.
 */
usageSchema.statics['getOrCreate'] = async function (
  userId: Types.ObjectId,
  month: string,
): Promise<UsageDocument> {
  const periodStart = new Date(`${month}-01T00:00:00.000Z`);
  const [year, mon] = month.split('-').map(Number) as [number, number];
  const nextMonth = mon === 12 ? `${year + 1}-01` : `${year}-${String(mon + 1).padStart(2, '0')}`;
  const resetAt = new Date(`${nextMonth}-01T00:00:00.000Z`);

  return (this as Model<UsageDocument>).findOneAndUpdate(
    { userId, month },
    {
      $setOnInsert: {
        userId,
        month,
        captionsUsed: 0,
        videosUsed: 0,
        postsUsed: 0,
        voiceClonesUsed: 0,
        periodStart,
        resetAt,
      },
    },
    { upsert: true, new: true },
  ) as Promise<UsageDocument>;
};

export const UsageModel: Model<UsageDocument> = model<UsageDocument>('Usage', usageSchema);

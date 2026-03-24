export enum Plan {
  Free = 'free',
  Starter = 'starter',
  Basic = 'basic',
  Pro = 'pro',
  Business = 'business',
  Enterprise = 'enterprise',
}

export enum SubscriptionStatus {
  Active = 'active',
  Trialing = 'trialing',
  PastDue = 'past_due',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
  Unpaid = 'unpaid',
  Paused = 'paused',
}

export interface PlanLimits {
  /** Max AI caption generations per month */
  captionsPerMonth: number;
  /** Max AI video generations per month */
  videosPerMonth: number;
  /** Max scheduled/published posts per month */
  postsPerMonth: number;
  /** Max connected social platforms */
  platformsAllowed: number;
  /** Max custom voice clones */
  voiceClonesAllowed: number;
}

export interface Subscription {
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

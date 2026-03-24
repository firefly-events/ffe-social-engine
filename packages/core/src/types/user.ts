import type { Plan } from './subscription.js';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: Date;
  /**
   * Per-user feature overrides. Keys are feature flag names, values override
   * the global/plan-level default.
   */
  features: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Pick<User, 'clerkId' | 'email'> & Partial<Pick<User, 'name'>>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'clerkId' | 'createdAt'>>;

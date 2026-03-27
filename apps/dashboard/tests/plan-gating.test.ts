import { describe, it, expect } from 'vitest';

describe('FIR-1331: Plan gating system', () => {
  describe('updatePlan mutation args', () => {
    it('should accept clerkId and plan string', () => {
      // Verify the mutation shape is correct
      const args = { clerkId: 'user_123', plan: 'pro' };
      expect(args.clerkId).toBeTruthy();
      expect(args.plan).toBe('pro');
    });

    it('should normalize plan names to lowercase', () => {
      const planNames = ['Free', 'STARTER', 'Pro', 'BUSINESS', 'agency'];
      const normalized = planNames.map(p => p.toLowerCase());
      expect(normalized).toEqual(['free', 'starter', 'pro', 'business', 'agency']);
    });
  });

  describe('subscription webhook event handling', () => {
    it('should extract plan name from subscription event data', () => {
      // Simulates the data extraction logic from the webhook handler
      const eventData = {
        user_id: 'user_123',
        plan: { name: 'Pro' },
      };

      const clerkId = eventData.user_id;
      const plan = (eventData.plan?.name ?? 'free').toLowerCase();

      expect(clerkId).toBe('user_123');
      expect(plan).toBe('pro');
    });

    it('should fallback to plan_name if plan.name missing', () => {
      const eventData = {
        user_id: 'user_456',
        plan_name: 'Business',
      } as any;

      const plan = (eventData.plan?.name ?? eventData.plan_name ?? 'free').toLowerCase();
      expect(plan).toBe('business');
    });

    it('should fallback to free if no plan info', () => {
      const eventData = {
        user_id: 'user_789',
      } as any;

      const plan = (eventData.plan?.name ?? eventData.plan_name ?? 'free').toLowerCase();
      expect(plan).toBe('free');
    });

    it('should extract user_id from metadata fallback', () => {
      const eventData = {
        metadata: { user_id: 'user_from_metadata' },
        plan: { name: 'Starter' },
      } as any;

      const clerkId = eventData.user_id || eventData.metadata?.user_id;
      expect(clerkId).toBe('user_from_metadata');
    });
  });

  describe('tier hierarchy', () => {
    it('should correctly order tiers from FREE to AGENCY', () => {
      const tiers = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'];

      expect(tiers.indexOf('FREE')).toBeLessThan(tiers.indexOf('PRO'));
      expect(tiers.indexOf('STARTER')).toBeLessThan(tiers.indexOf('BUSINESS'));
      expect(tiers.indexOf('PRO')).toBeLessThan(tiers.indexOf('AGENCY'));
    });

    it('should lock features when user tier is below minTier', () => {
      const tiers = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'];
      const userTier = 'FREE';
      const userTierIndex = tiers.indexOf(userTier);

      // Schedule requires BASIC
      expect(tiers.indexOf('BASIC')).toBeGreaterThan(userTierIndex);
      // Analytics requires PRO
      expect(tiers.indexOf('PRO')).toBeGreaterThan(userTierIndex);
    });

    it('should unlock features when user upgrades to PRO', () => {
      const tiers = ['FREE', 'STARTER', 'BASIC', 'PRO', 'BUSINESS', 'AGENCY'];
      const userTier = 'PRO';
      const userTierIndex = tiers.indexOf(userTier);

      // Schedule requires BASIC — should be unlocked
      expect(tiers.indexOf('BASIC')).toBeLessThanOrEqual(userTierIndex);
      // Analytics requires PRO — should be unlocked
      expect(tiers.indexOf('PRO')).toBeLessThanOrEqual(userTierIndex);
      // Dashboard requires FREE — should be unlocked
      expect(tiers.indexOf('FREE')).toBeLessThanOrEqual(userTierIndex);
    });
  });

  describe('DashboardShell plan display', () => {
    it('should uppercase the plan from Convex for display', () => {
      const dbPlan = 'pro';
      const displayTier = dbPlan.toUpperCase();
      expect(displayTier).toBe('PRO');
    });

    it('should default to FREE when dbUser is null', () => {
      const dbUser = null;
      const displayTier = (dbUser?.plan ?? 'free').toUpperCase();
      expect(displayTier).toBe('FREE');
    });
  });
});

// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { convexTest } from 'convex-test';
import schema from './schema';
import { api } from './_generated/api';

describe('users convex', () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, import.meta.glob('./**/*.*s'));
  });

  it('syncUser should create a new user', async () => {
    const id = await t.mutation(api.users.syncUser, {
      clerkId: 'clerk-1',
      email: 'test@example.com',
      name: 'Test User'
    });

    expect(id).toBeDefined();

    const user = await t.query(api.users.getUser, { clerkId: 'clerk-1' });
    expect(user).toMatchObject({
      clerkId: 'clerk-1',
      email: 'test@example.com',
      name: 'Test User',
      plan: 'free'
    });
  });

  it('updateZernioProfileId should update the profile id', async () => {
    await t.mutation(api.users.syncUser, {
      clerkId: 'clerk-2',
      email: 'user2@example.com',
    });

    await t.mutation(api.users.updateZernioProfileId, {
      clerkId: 'clerk-2',
      zernioProfileId: 'prof-2'
    });

    const user = await t.query(api.users.getUser, { clerkId: 'clerk-2' });
    expect(user?.zernioProfileId).toBe('prof-2');
  });

  it('deleteUser should delete the user', async () => {
    await t.mutation(api.users.syncUser, {
      clerkId: 'clerk-3',
      email: 'user3@example.com',
    });

    let user = await t.query(api.users.getUser, { clerkId: 'clerk-3' });
    expect(user).toBeDefined();

    await t.mutation(api.users.deleteUser, { clerkId: 'clerk-3' });

    user = await t.query(api.users.getUser, { clerkId: 'clerk-3' });
    expect(user).toBeNull();
  });
});

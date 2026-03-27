import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUser = { plan: 'starter', clerkId: 'user_test' };

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test' }),
}));

vi.mock('@/lib/convex-client', () => ({
  convexClient: {
    query: vi.fn().mockImplementation((fn) => {
      if (fn === 'getUserReminders') return Promise.resolve([]);
      return Promise.resolve(mockUser);
    }),
    mutation: vi.fn().mockResolvedValue('reminder_id'),
  },
}));

vi.mock('@convex/_generated/api', () => ({
  api: {
    reminders: {
      getUserReminders: 'getUserReminders',
      createReminder: 'createReminder',
    },
    users: {
      getUser: 'getUser',
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { convexClient } from '@/lib/convex-client';
import { GET, POST } from './route';

describe('GET /api/reminders', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_test' } as any);
    vi.mocked(convexClient.query).mockImplementation((fn) => {
      if (fn === 'getUserReminders') return Promise.resolve([]);
      return Promise.resolve(mockUser);
    });
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
    const req = new NextRequest('http://localhost/api/reminders');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns list of reminders', async () => {
    const req = new NextRequest('http://localhost/api/reminders');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.reminders)).toBe(true);
  });
});

describe('POST /api/reminders', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_test' } as any);
    vi.mocked(convexClient.query).mockResolvedValue(mockUser as any);
    vi.mocked(convexClient.mutation).mockResolvedValue('reminder_id' as any);
  });

  it('returns 402 for free plan', async () => {
    vi.mocked(convexClient.query).mockResolvedValueOnce({ plan: 'free' } as any);

    const req = new NextRequest('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({
        platform: 'nextdoor',
        title: 'Test',
        body: 'Test content',
        scheduledFor: Date.now() + 86400000,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(402);
  });

  it('creates reminder for paid plan', async () => {
    const req = new NextRequest('http://localhost/api/reminders', {
      method: 'POST',
      body: JSON.stringify({
        platform: 'nextdoor',
        title: 'Post to Nextdoor',
        body: 'Community event this Saturday!',
        scheduledFor: Date.now() + 86400000,
        reminderType: 'in-app',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.status).toBe('pending');
    expect(data.platform).toBe('nextdoor');
  });
});

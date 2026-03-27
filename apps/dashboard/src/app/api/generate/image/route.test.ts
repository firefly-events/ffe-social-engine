import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test' }),
}));

vi.mock('@/lib/convex-client', () => ({
  convexClient: {
    mutation: vi.fn().mockResolvedValue('job_123'),
  },
}));

vi.mock('@convex/_generated/api', () => ({
  api: {
    generations: {
      createJob: 'createJob',
      completeJob: 'completeJob',
      failJob: 'failJob',
    },
  },
}));

// No API keys in test environment → uses placeholder path
delete process.env.TOGETHER_API_KEY;
delete process.env.REPLICATE_API_TOKEN;

import { auth } from '@clerk/nextjs/server';
import { POST } from './route';

describe('POST /api/generate/image', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_test' } as any);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);

    const req = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when prompt is missing', async () => {
    const req = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns placeholder imageUrl in dev (no API keys)', async () => {
    const req = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'A sunset beach', aspectRatio: '16:9' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobId).toBe('job_123');
    expect(data.imageUrl).toContain('placehold.co');
    expect(data.provider).toBe('placeholder');
  });
});

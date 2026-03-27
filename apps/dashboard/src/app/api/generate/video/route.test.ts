import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'user_test' }),
}));

vi.mock('@/lib/convex-client', () => ({
  convexClient: {
    mutation: vi.fn().mockResolvedValue('job_456'),
    query: vi.fn().mockResolvedValue({
      userId: 'user_test',
      status: 'completed',
      result: { videoUrl: 'https://example.com/video.mp4', provider: 'placeholder' },
      error: null,
    }),
  },
}));

vi.mock('@convex/_generated/api', () => ({
  api: {
    generations: {
      createJob: 'createJob',
      completeJob: 'completeJob',
      failJob: 'failJob',
      getJob: 'getJob',
    },
  },
}));

delete process.env.FAL_KEY;
delete process.env.REPLICATE_API_TOKEN;

import { auth } from '@clerk/nextjs/server';
import { POST, GET } from './route';

describe('POST /api/generate/video', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_test' } as any);
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
    const req = new NextRequest('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns pending jobId on success', async () => {
    const req = new NextRequest('http://localhost/api/generate/video', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'A dancing robot' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobId).toBe('job_456');
    expect(data.status).toBe('pending');
  });
});

describe('GET /api/generate/video', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_test' } as any);
  });

  it('returns job status', async () => {
    const req = new NextRequest('http://localhost/api/generate/video?jobId=job_456');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('completed');
  });
});

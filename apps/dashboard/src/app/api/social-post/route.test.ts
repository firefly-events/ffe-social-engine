import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/event-api', () => ({
  getEvent: vi.fn(),
}));

vi.mock('@/lib/event-content-generator', () => ({
  generateSocialPost: vi.fn(),
}));

vi.mock('@/lib/zernio', () => ({
  zernio: {
    createPost: vi.fn(),
  },
}));

import { POST } from './route';
import { getEvent } from '@/lib/event-api';
import { generateSocialPost } from '@/lib/event-content-generator';
import { zernio } from '@/lib/zernio';

const mockEvent = {
  id: 'evt-1',
  title: 'Summer Gala',
  description: 'A summer event',
  date: '2026-07-15',
  location: 'Central Park',
  organizer: 'Firefly',
};

function makeRequest(
  body: object,
  headers: Record<string, string> = {},
): Request {
  return new Request('http://localhost/api/social-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/social-post', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('generates post with valid request', async () => {
    vi.mocked(getEvent).mockResolvedValue(mockEvent);
    vi.mocked(generateSocialPost).mockResolvedValue('Generated post content');

    const res = await POST(
      makeRequest(
        { eventId: 'evt-1', platform: 'twitter' },
        { 'x-cron-secret': 'test-cron-secret' },
      ),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.content).toBe('Generated post content');
    expect(json.published).toBe(false);
  });

  it('returns 500 when CRON_SECRET is missing', async () => {
    delete process.env.CRON_SECRET;

    const res = await POST(
      makeRequest(
        { eventId: 'evt-1', platform: 'twitter' },
        { 'x-cron-secret': 'anything' },
      ),
    );

    expect(res.status).toBe(500);
  });

  it('returns 401 for invalid CRON_SECRET', async () => {
    const res = await POST(
      makeRequest(
        { eventId: 'evt-1', platform: 'twitter' },
        { 'x-cron-secret': 'wrong-secret' },
      ),
    );

    expect(res.status).toBe(401);
  });

  it('returns 404 when event is not found', async () => {
    vi.mocked(getEvent).mockResolvedValue(null);

    const res = await POST(
      makeRequest(
        { eventId: 'nonexistent', platform: 'twitter' },
        { 'x-cron-secret': 'test-cron-secret' },
      ),
    );

    expect(res.status).toBe(404);
  });

  it('generates content for specified platform', async () => {
    vi.mocked(getEvent).mockResolvedValue(mockEvent);
    vi.mocked(generateSocialPost).mockResolvedValue('Instagram post!');

    await POST(
      makeRequest(
        { eventId: 'evt-1', platform: 'instagram' },
        { 'x-cron-secret': 'test-cron-secret' },
      ),
    );

    expect(vi.mocked(generateSocialPost)).toHaveBeenCalledWith(mockEvent, 'instagram');
  });

  it('publishes via Zernio when zernioProfileId is provided', async () => {
    vi.mocked(getEvent).mockResolvedValue(mockEvent);
    vi.mocked(generateSocialPost).mockResolvedValue('Post content');
    vi.mocked(zernio.createPost).mockResolvedValue({ success: true });

    const res = await POST(
      makeRequest(
        { eventId: 'evt-1', platform: 'twitter', zernioProfileId: 'profile-1' },
        { 'x-cron-secret': 'test-cron-secret' },
      ),
    );
    const json = await res.json();

    expect(json.published).toBe(true);
    expect(vi.mocked(zernio.createPost)).toHaveBeenCalledWith(
      'profile-1',
      'Post content',
      ['twitter'],
    );
  });

  it('skips Zernio when no zernioProfileId', async () => {
    vi.mocked(getEvent).mockResolvedValue(mockEvent);
    vi.mocked(generateSocialPost).mockResolvedValue('Post content');

    const res = await POST(
      makeRequest(
        { eventId: 'evt-1', platform: 'twitter' },
        { 'x-cron-secret': 'test-cron-secret' },
      ),
    );
    const json = await res.json();

    expect(json.published).toBe(false);
    expect(vi.mocked(zernio.createPost)).not.toHaveBeenCalled();
  });
});

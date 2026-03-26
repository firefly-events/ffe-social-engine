import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/event-api', () => ({
  getUpcomingEvents: vi.fn(),
}));

vi.mock('@/lib/event-content-generator', () => ({
  generateWeeklyDigest: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendEmail: vi.fn(),
}));

import { POST } from './route';
import { getUpcomingEvents } from '@/lib/event-api';
import { generateWeeklyDigest } from '@/lib/event-content-generator';
import { sendEmail } from '@/lib/resend';

const mockEvents = [
  {
    id: 'evt-1',
    title: 'Summer Gala',
    description: 'A summer event',
    date: '2026-07-15',
    location: 'Central Park',
    organizer: 'Firefly',
  },
];

function makeRequest(
  headers: Record<string, string> = {},
  body?: object,
): Request {
  return new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe('POST /api/newsletter', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('processes successfully with valid CRON_SECRET', async () => {
    vi.mocked(getUpcomingEvents).mockResolvedValue(mockEvents);
    vi.mocked(generateWeeklyDigest).mockResolvedValue('<html>digest</html>');
    vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-1' });

    const res = await POST(
      makeRequest({ 'x-cron-secret': 'test-cron-secret' }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.eventsCount).toBe(1);
  });

  it('returns 401 for invalid CRON_SECRET', async () => {
    const res = await POST(
      makeRequest({ 'x-cron-secret': 'wrong-secret' }),
    );

    expect(res.status).toBe(401);
  });

  it('returns 500 when CRON_SECRET env is missing (fail-closed)', async () => {
    delete process.env.CRON_SECRET;

    const res = await POST(makeRequest({ 'x-cron-secret': 'anything' }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain('CRON_SECRET not configured');
  });

  it('returns success with no-events message when no events available', async () => {
    vi.mocked(getUpcomingEvents).mockResolvedValue([]);

    const res = await POST(
      makeRequest({ 'x-cron-secret': 'test-cron-secret' }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain('No events');
  });

  it('handles email send failure gracefully', async () => {
    vi.mocked(getUpcomingEvents).mockResolvedValue(mockEvents);
    vi.mocked(generateWeeklyDigest).mockResolvedValue('<html>digest</html>');
    vi.mocked(sendEmail).mockResolvedValue({ success: false, error: 'Send failed' });

    const res = await POST(
      makeRequest({ 'x-cron-secret': 'test-cron-secret' }),
    );
    const json = await res.json();

    // The route returns 500 when email sending fails
    expect(res.status).toBe(500);
    expect(json.emailResult.success).toBe(false);
  });

  it('uses subscriber email from request body', async () => {
    vi.mocked(getUpcomingEvents).mockResolvedValue(mockEvents);
    vi.mocked(generateWeeklyDigest).mockResolvedValue('<html>digest</html>');
    vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-2' });

    await POST(
      makeRequest(
        { 'x-cron-secret': 'test-cron-secret' },
        { to: 'custom@example.com' },
      ),
    );

    expect(vi.mocked(sendEmail)).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'custom@example.com' }),
    );
  });

  it('uses default email when body has no to field', async () => {
    vi.mocked(getUpcomingEvents).mockResolvedValue(mockEvents);
    vi.mocked(generateWeeklyDigest).mockResolvedValue('<html>digest</html>');
    vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-3' });

    await POST(
      makeRequest({ 'x-cron-secret': 'test-cron-secret' }),
    );

    expect(vi.mocked(sendEmail)).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'newsletter@fireflyevents.io' }),
    );
  });

  it('fetches events and generates digest correctly', async () => {
    vi.mocked(getUpcomingEvents).mockResolvedValue(mockEvents);
    vi.mocked(generateWeeklyDigest).mockResolvedValue('<html>weekly</html>');
    vi.mocked(sendEmail).mockResolvedValue({ success: true, id: 'email-4' });

    await POST(
      makeRequest({ 'x-cron-secret': 'test-cron-secret' }),
    );

    expect(vi.mocked(getUpcomingEvents)).toHaveBeenCalledWith(10);
    expect(vi.mocked(generateWeeklyDigest)).toHaveBeenCalledWith(mockEvents);
    expect(vi.mocked(sendEmail)).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Weekly Event Digest',
        html: '<html>weekly</html>',
      }),
    );
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';

// Must import after env is set up
import { POST } from './route';

function signPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function makeRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/event-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  });
}

describe('POST /api/event-webhook', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.WEBHOOK_SECRET = 'test-webhook-secret';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('processes event with valid HMAC signature', async () => {
    const body = JSON.stringify({ type: 'event.created', data: { id: 'evt-1' } });
    const signature = signPayload(body, 'test-webhook-secret');

    const res = await POST(makeRequest(body, { 'x-webhook-signature': signature }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
    expect(json.eventType).toBe('event.created');
  });

  it('returns 401 for invalid HMAC signature', async () => {
    const body = JSON.stringify({ type: 'event.created', data: {} });

    const res = await POST(makeRequest(body, { 'x-webhook-signature': 'invalid-signature' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 when signature header is missing', async () => {
    const body = JSON.stringify({ type: 'event.created', data: {} });

    const res = await POST(makeRequest(body));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toContain('Missing x-webhook-signature');
  });

  it('rejects wrong-length signature via timing-safe comparison', async () => {
    const body = JSON.stringify({ type: 'event.created', data: {} });

    const res = await POST(makeRequest(body, { 'x-webhook-signature': 'short' }));
    expect(res.status).toBe(401);
  });

  it('processes event.created type', async () => {
    const body = JSON.stringify({ type: 'event.created', data: { id: 'evt-1' } });
    const signature = signPayload(body, 'test-webhook-secret');

    const res = await POST(makeRequest(body, { 'x-webhook-signature': signature }));
    const json = await res.json();

    expect(json.eventType).toBe('event.created');
  });

  it('processes event.updated type', async () => {
    const body = JSON.stringify({ type: 'event.updated', data: { id: 'evt-1' } });
    const signature = signPayload(body, 'test-webhook-secret');

    const res = await POST(makeRequest(body, { 'x-webhook-signature': signature }));
    const json = await res.json();

    expect(json.eventType).toBe('event.updated');
  });

  it('handles unknown event type gracefully', async () => {
    const body = JSON.stringify({ type: 'event.deleted', data: {} });
    const signature = signPayload(body, 'test-webhook-secret');

    const res = await POST(makeRequest(body, { 'x-webhook-signature': signature }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.eventType).toBe('event.deleted');
  });

  it('returns 500 when WEBHOOK_SECRET missing in production', async () => {
    delete process.env.WEBHOOK_SECRET;
    process.env.NODE_ENV = 'production';

    const body = JSON.stringify({ type: 'event.created', data: {} });
    const res = await POST(makeRequest(body));

    expect(res.status).toBe(500);
  });

  it('allows passthrough when WEBHOOK_SECRET missing in dev', async () => {
    delete process.env.WEBHOOK_SECRET;
    process.env.NODE_ENV = 'development';

    const body = JSON.stringify({ type: 'event.created', data: { id: 'evt-1' } });
    const res = await POST(makeRequest(body));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
  });

  it('returns 400 for malformed JSON body', async () => {
    delete process.env.WEBHOOK_SECRET;
    process.env.NODE_ENV = 'development';

    const res = await POST(makeRequest('not-json'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Invalid JSON');
  });
});

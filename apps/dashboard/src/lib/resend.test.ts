import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendEmail } from './resend';

describe('sendEmail', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.RESEND_FROM_EMAIL = 'events@firefly.test';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns success with id on successful send', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-123' }),
    });

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(result).toEqual({ success: true, id: 'email-123' });
  });

  it('returns failure on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => 'Validation error',
    });

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result).toEqual({ success: false, error: 'Resend API error: 422' });
  });

  it('returns failure on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result).toEqual({ success: false, error: 'Connection refused' });
  });

  it('returns failure when API key is missing', async () => {
    delete process.env.RESEND_API_KEY;
    global.fetch = vi.fn();

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result).toEqual({ success: false, error: 'Resend API key not configured' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sends correct request body format', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-456' }),
    });

    await sendEmail({
      to: 'user@example.com',
      subject: 'Weekly Digest',
      html: '<h1>Digest</h1>',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-resend-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'events@firefly.test',
          to: ['user@example.com'],
          subject: 'Weekly Digest',
          html: '<h1>Digest</h1>',
        }),
      }),
    );
  });

  it('uses default from email when env var is not set', async () => {
    delete process.env.RESEND_FROM_EMAIL;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-789' }),
    });

    await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    const callBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(callBody.from).toBe('noreply@firefly.events');
  });

  it('wraps single to address in array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-abc' }),
    });

    await sendEmail({
      to: 'single@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    const callBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(callBody.to).toEqual(['single@example.com']);
  });

  it('passes array of to addresses as-is', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-def' }),
    });

    await sendEmail({
      to: ['a@example.com', 'b@example.com'],
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    const callBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(callBody.to).toEqual(['a@example.com', 'b@example.com']);
  });

  it('passes HTML content correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-html' }),
    });

    const complexHtml = '<html><body><h1>Title</h1><p>Content with <strong>bold</strong></p></body></html>';
    await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: complexHtml,
    });

    const callBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(callBody.html).toBe(complexHtml);
  });

  it('handles non-Error thrown objects in catch', async () => {
    global.fetch = vi.fn().mockRejectedValue('string error');

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result).toEqual({ success: false, error: 'Unknown error' });
  });

  it('handles API error with JSON error body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: 'Bad request' }),
    });

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Resend API error: 400');
  });
});

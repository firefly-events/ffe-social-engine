import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail, renderNewsletterHtml } from './resend';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Resend Email Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email_123' }),
      });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });

      expect(result).toEqual({ id: 'email_123' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('resend.com/emails');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.to).toEqual(['test@example.com']);
      expect(body.subject).toBe('Test Subject');
    });

    it('should handle array of recipients', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email_456' }),
      });

      await sendEmail({
        to: ['a@test.com', 'b@test.com'],
        subject: 'Test',
        html: '<p>Hi</p>',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.to).toEqual(['a@test.com', 'b@test.com']);
    });

    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(
        sendEmail({ to: 'test@test.com', subject: 'Test', html: '<p>Hi</p>' })
      ).rejects.toThrow('Resend API error 401');
    });
  });

  describe('renderNewsletterHtml', () => {
    it('should render a basic newsletter', () => {
      const html = renderNewsletterHtml({
        subject: 'Weekly Events',
        sections: [
          {
            title: 'Concert in the Park',
            body: 'Join us for a night of music',
          },
        ],
      });

      expect(html).toContain('Concert in the Park');
      expect(html).toContain('Join us for a night of music');
      expect(html).toContain('Firefly Events');
    });

    it('should include preheader when provided', () => {
      const html = renderNewsletterHtml({
        subject: 'Test',
        preheader: 'Preview text here',
        sections: [{ title: 'Title', body: 'Body' }],
      });

      expect(html).toContain('Preview text here');
    });

    it('should render CTA buttons when ctaUrl is provided', () => {
      const html = renderNewsletterHtml({
        subject: 'Test',
        sections: [
          {
            title: 'Event',
            body: 'Description',
            ctaUrl: 'https://tickets.example.com',
            ctaText: 'Buy Tickets',
          },
        ],
      });

      expect(html).toContain('https://tickets.example.com');
      expect(html).toContain('Buy Tickets');
    });

    it('should render images when imageUrl is provided', () => {
      const html = renderNewsletterHtml({
        subject: 'Test',
        sections: [
          {
            title: 'Event',
            body: 'Desc',
            imageUrl: 'https://img.example.com/photo.jpg',
          },
        ],
      });

      expect(html).toContain('https://img.example.com/photo.jpg');
    });
  });
});

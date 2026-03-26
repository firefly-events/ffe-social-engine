import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { EventData } from './event-api';

// Mock the Google Generative AI module
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel = mockGetGenerativeModel;
    },
  };
});

import { generateSocialPost, generateWeeklyDigest } from './event-content-generator';

const mockEvent: EventData = {
  id: 'evt-1',
  title: 'Summer Gala',
  description: 'A wonderful summer event with music and food',
  date: '2026-07-15',
  location: 'Central Park',
  organizer: 'Firefly Events',
  category: 'social',
  url: 'https://example.com/event',
};

describe('event-content-generator', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_API_KEY = 'test-google-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('generateSocialPost', () => {
    it('generates post for instagram via AI', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Check out Summer Gala! #events' },
      });

      const post = await generateSocialPost(mockEvent, 'instagram');
      expect(post).toBe('Check out Summer Gala! #events');
    });

    it('generates post for twitter via AI', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Summer Gala is coming! #SummerGala' },
      });

      const post = await generateSocialPost(mockEvent, 'twitter');
      expect(post).toBe('Summer Gala is coming! #SummerGala');
    });

    it('generates post for facebook via AI', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Join us at Summer Gala!' },
      });

      const post = await generateSocialPost(mockEvent, 'facebook');
      expect(post).toBe('Join us at Summer Gala!');
    });

    it('generates post for linkedin via AI', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Excited to announce Summer Gala' },
      });

      const post = await generateSocialPost(mockEvent, 'linkedin');
      expect(post).toBe('Excited to announce Summer Gala');
    });

    it('falls back to template on AI error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI unavailable'));

      const post = await generateSocialPost(mockEvent, 'instagram');
      expect(post).toContain('Summer Gala');
      expect(post).toContain('2026-07-15');
    });

    it('falls back to template on missing API key', async () => {
      delete process.env.GOOGLE_API_KEY;

      const post = await generateSocialPost(mockEvent, 'instagram');
      expect(post).toContain('Summer Gala');
      expect(post).toContain('2026-07-15');
    });

    it('twitter fallback template contains event title and date', async () => {
      delete process.env.GOOGLE_API_KEY;

      const post = await generateSocialPost(mockEvent, 'twitter');
      expect(post).toContain("Don't miss Summer Gala");
      expect(post).toContain('2026-07-15');
      expect(post).toContain('Central Park');
    });

    it('fallback template includes location', async () => {
      delete process.env.GOOGLE_API_KEY;

      const post = await generateSocialPost(mockEvent, 'facebook');
      expect(post).toContain('at Central Park');
    });

    it('falls back when AI returns empty string', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '' },
      });

      const post = await generateSocialPost(mockEvent, 'twitter');
      expect(post).toContain('Summer Gala');
    });

    it('uses platform-specific prompt guidance', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Generated post' },
      });

      await generateSocialPost(mockEvent, 'twitter');
      const prompt = mockGenerateContent.mock.calls[0][0];
      expect(prompt).toContain('280 characters');
    });
  });

  describe('generateWeeklyDigest', () => {
    it('generates HTML digest via AI', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '<html><body><h1>Weekly Events Digest</h1></body></html>' },
      });

      const html = await generateWeeklyDigest([mockEvent]);
      expect(html).toContain('<html>');
      expect(html).toContain('Weekly Events Digest');
    });

    it('falls back to template on AI error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI unavailable'));

      const html = await generateWeeklyDigest([mockEvent]);
      expect(html).toContain('Weekly Events Digest');
      expect(html).toContain('Summer Gala');
    });

    it('fallback template contains event titles', async () => {
      delete process.env.GOOGLE_API_KEY;

      const events: EventData[] = [
        mockEvent,
        { ...mockEvent, id: 'evt-2', title: 'Winter Ball' },
      ];

      const html = await generateWeeklyDigest(events);
      expect(html).toContain('Summer Gala');
      expect(html).toContain('Winter Ball');
    });

    it('handles empty events array with fallback', async () => {
      // When events is empty, it uses fallback directly (client check)
      const html = await generateWeeklyDigest([]);
      expect(html).toContain('Weekly Events Digest');
      expect(html).toContain('No upcoming events this week.');
    });

    it('handles single event', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => '<html><body><h1>Weekly Events Digest</h1><p>Summer Gala</p></body></html>' },
      });

      const html = await generateWeeklyDigest([mockEvent]);
      expect(html).toContain('Summer Gala');
    });

    it('fallback HTML structure is valid', async () => {
      delete process.env.GOOGLE_API_KEY;

      const html = await generateWeeklyDigest([mockEvent]);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
      expect(html).toContain('Powered by Firefly Events');
    });

    it('falls back when AI returns non-HTML response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'This is not HTML at all' },
      });

      const html = await generateWeeklyDigest([mockEvent]);
      // The non-HTML response won't contain < and >, so it falls back
      // Actually "This is not HTML at all" has no < >, so fallback is used
      expect(html).toContain('Weekly Events Digest');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });
});

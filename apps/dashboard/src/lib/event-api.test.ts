import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUpcomingEvents, getEvent, searchEvents, EventData } from './event-api';

const mockEvent: EventData = {
  id: 'evt-1',
  title: 'Summer Gala',
  description: 'A wonderful summer event',
  date: '2026-07-15',
  location: 'Central Park',
  organizer: 'Firefly Events',
  category: 'social',
  imageUrl: 'https://example.com/image.jpg',
  url: 'https://example.com/event',
};

describe('EventAPI client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.EVENT_API_BASE_URL = 'https://api.events.test';
    process.env.EVENT_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getUpcomingEvents', () => {
    it('returns events on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [mockEvent],
      });

      const events = await getUpcomingEvents();
      expect(events).toEqual([mockEvent]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.events.test/events/upcoming?limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        }),
      );
    });

    it('returns empty array when API returns empty list', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const events = await getUpcomingEvents();
      expect(events).toEqual([]);
    });

    it('returns empty array on API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const events = await getUpcomingEvents();
      expect(events).toEqual([]);
    });

    it('returns empty array on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const events = await getUpcomingEvents();
      expect(events).toEqual([]);
    });

    it('uses custom limit parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await getUpcomingEvents(5);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.events.test/events/upcoming?limit=5',
        expect.any(Object),
      );
    });

    it('sends correct auth header', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await getUpcomingEvents();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
        }),
      );
    });
  });

  describe('getEvent', () => {
    it('returns event on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockEvent,
      });

      const event = await getEvent('evt-1');
      expect(event).toEqual(mockEvent);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.events.test/events/evt-1',
        expect.any(Object),
      );
    });

    it('returns null on not found', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const event = await getEvent('nonexistent');
      expect(event).toBeNull();
    });

    it('returns null on API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const event = await getEvent('evt-1');
      expect(event).toBeNull();
    });

    it('returns null on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const event = await getEvent('evt-1');
      expect(event).toBeNull();
    });
  });

  describe('searchEvents', () => {
    it('returns results on success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [mockEvent],
      });

      const results = await searchEvents('summer');
      expect(results).toEqual([mockEvent]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.events.test/events/search?q=summer',
        expect.any(Object),
      );
    });

    it('returns empty array for empty results', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      const results = await searchEvents('nonexistent');
      expect(results).toEqual([]);
    });

    it('returns empty array on API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const results = await searchEvents('summer');
      expect(results).toEqual([]);
    });

    it('returns empty array on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const results = await searchEvents('summer');
      expect(results).toEqual([]);
    });
  });

  describe('missing env vars', () => {
    it('returns null/empty when base URL is missing', async () => {
      delete process.env.EVENT_API_BASE_URL;
      global.fetch = vi.fn();

      const events = await getUpcomingEvents();
      expect(events).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns null/empty when API key is missing', async () => {
      delete process.env.EVENT_API_KEY;
      global.fetch = vi.fn();

      const event = await getEvent('evt-1');
      expect(event).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

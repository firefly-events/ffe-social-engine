import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEvents, fetchEventById, registerWebhook } from './event-api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Event API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEvents', () => {
    it('should fetch events with no filters', async () => {
      const mockResponse = {
        events: [{ id: '1', title: 'Test Event', description: 'desc', category: 'music', location: 'NYC', venue: 'Madison Square Garden', startDate: '2026-04-01', endDate: '2026-04-01', organizer: 'FFE', tags: ['music'] }],
        total: 1,
        hasMore: false,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchEvents();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('/events');
    });

    it('should apply category and location filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ events: [], total: 0, hasMore: false }),
      });

      await fetchEvents({ categories: ['music', 'art'], location: 'NYC' });
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('categories=music%2Cart');
      expect(callUrl).toContain('location=NYC');
    });

    it('should throw on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      });

      await expect(fetchEvents()).rejects.toThrow('Event API error 500');
    });
  });

  describe('fetchEventById', () => {
    it('should fetch a single event', async () => {
      const mockEvent = { id: '123', title: 'Test', description: '', category: 'music', location: 'NYC', venue: 'Venue', startDate: '2026-04-01', endDate: '', organizer: 'FFE', tags: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvent),
      });

      const result = await fetchEventById('123');
      expect(result).toEqual(mockEvent);
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('/events/123');
    });
  });

  describe('registerWebhook', () => {
    it('should register a webhook', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ webhookId: 'wh_123' }),
      });

      const result = await registerWebhook('https://example.com/webhook', ['event.created']);
      expect(result).toEqual({ webhookId: 'wh_123' });
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });
  });
});

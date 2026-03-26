import { describe, it, expect } from 'vitest';
import { buildEventSocialPrompt, buildNewsletterPrompt } from './event-content-generator';
import type { EventApiEvent } from './event-api';

const mockEvent: EventApiEvent = {
  id: 'evt_1',
  title: 'Summer Music Festival',
  description: 'The biggest music festival of the year',
  category: 'music',
  location: 'Austin, TX',
  venue: 'Zilker Park',
  startDate: '2026-06-15',
  endDate: '2026-06-17',
  organizer: 'ATX Events',
  tags: ['music', 'festival', 'outdoor'],
  ticketUrl: 'https://tickets.example.com/summer-fest',
  imageUrl: 'https://img.example.com/festival.jpg',
};

describe('Event Content Generator', () => {
  describe('buildEventSocialPrompt', () => {
    it('should include event details in the prompt', () => {
      const prompt = buildEventSocialPrompt(mockEvent, 'instagram');
      expect(prompt).toContain('Summer Music Festival');
      expect(prompt).toContain('Austin, TX');
      expect(prompt).toContain('Zilker Park');
      expect(prompt).toContain('instagram');
      expect(prompt).toContain('music, festival, outdoor');
    });

    it('should include platform-specific guidelines', () => {
      const twitterPrompt = buildEventSocialPrompt(mockEvent, 'twitter');
      expect(twitterPrompt).toContain('280 char max');

      const instagramPrompt = buildEventSocialPrompt(mockEvent, 'instagram');
      expect(instagramPrompt).toContain('2200 char max');
    });

    it('should include ticket URL when available', () => {
      const prompt = buildEventSocialPrompt(mockEvent, 'facebook');
      expect(prompt).toContain('https://tickets.example.com/summer-fest');
    });
  });

  describe('buildNewsletterPrompt', () => {
    it('should include all events in the prompt', () => {
      const events = [mockEvent, { ...mockEvent, id: 'evt_2', title: 'Jazz Night' }];
      const prompt = buildNewsletterPrompt(events);
      expect(prompt).toContain('Summer Music Festival');
      expect(prompt).toContain('Jazz Night');
      expect(prompt).toContain('1.');
      expect(prompt).toContain('2.');
    });

    it('should request JSON output format', () => {
      const prompt = buildNewsletterPrompt([mockEvent]);
      expect(prompt).toContain('JSON');
    });
  });
});

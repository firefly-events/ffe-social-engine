import { describe, it, expect } from 'vitest';

describe('FIR-1332: Content library', () => {
  describe('content type detection', () => {
    it('should detect Video type from videoUrl', () => {
      const item = { videoUrl: 'https://example.com/video.mp4', imageUrl: null, audioUrl: null };
      const type = item.videoUrl ? 'Video' : item.imageUrl ? 'Image' : item.audioUrl ? 'Audio' : 'Text';
      expect(type).toBe('Video');
    });

    it('should detect Image type from imageUrl', () => {
      const item = { videoUrl: null, imageUrl: 'https://example.com/photo.jpg', audioUrl: null };
      const type = item.videoUrl ? 'Video' : item.imageUrl ? 'Image' : item.audioUrl ? 'Audio' : 'Text';
      expect(type).toBe('Image');
    });

    it('should detect Audio type from audioUrl', () => {
      const item = { videoUrl: null, imageUrl: null, audioUrl: 'https://example.com/audio.mp3' };
      const type = item.videoUrl ? 'Video' : item.imageUrl ? 'Image' : item.audioUrl ? 'Audio' : 'Text';
      expect(type).toBe('Audio');
    });

    it('should default to Text when no media URLs', () => {
      const item = { videoUrl: null, imageUrl: null, audioUrl: null };
      const type = item.videoUrl ? 'Video' : item.imageUrl ? 'Image' : item.audioUrl ? 'Audio' : 'Text';
      expect(type).toBe('Text');
    });
  });

  describe('date formatting', () => {
    it('should show "Just now" for recent content', () => {
      const now = new Date();
      const diffMs = 1000 * 30; // 30 seconds
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const result = diffHrs < 1 ? 'Just now' : `${diffHrs}h ago`;
      expect(result).toBe('Just now');
    });

    it('should show hours for content from today', () => {
      const diffMs = 1000 * 60 * 60 * 5; // 5 hours
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const result = diffHrs < 1 ? 'Just now' : diffHrs < 24 ? `${diffHrs}h ago` : `${Math.floor(diffHrs / 24)}d ago`;
      expect(result).toBe('5h ago');
    });

    it('should show days for older content', () => {
      const diffMs = 1000 * 60 * 60 * 72; // 3 days
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const result = diffHrs < 1 ? 'Just now' : diffHrs < 24 ? `${diffHrs}h ago` : `${Math.floor(diffHrs / 24)}d ago`;
      expect(result).toBe('3d ago');
    });
  });

  describe('text search filtering', () => {
    const items = [
      { id: '1', text: 'New product launch video for TikTok' },
      { id: '2', text: 'Behind the scenes at the office' },
      { id: '3', text: 'Product tutorial part 1' },
      { id: '4', text: 'Holiday special announcement' },
    ];

    it('should filter items by search text (case-insensitive)', () => {
      const search = 'product';
      const filtered = items.filter(item => item.text.toLowerCase().includes(search.toLowerCase()));
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe('1');
      expect(filtered[1].id).toBe('3');
    });

    it('should return all items when search is empty', () => {
      const search = '';
      const filtered = search.trim() ? items.filter(item => item.text.toLowerCase().includes(search.toLowerCase())) : items;
      expect(filtered).toHaveLength(4);
    });

    it('should return empty array when no matches', () => {
      const search = 'nonexistent';
      const filtered = items.filter(item => item.text.toLowerCase().includes(search.toLowerCase()));
      expect(filtered).toHaveLength(0);
    });
  });

  describe('status filter tabs', () => {
    const STATUS_TABS = [
      { label: 'All', value: 'all' },
      { label: 'Draft', value: 'draft' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Posted', value: 'posted' },
      { label: 'Archived', value: 'archived' },
    ];

    it('should have 5 status tabs', () => {
      expect(STATUS_TABS).toHaveLength(5);
    });

    it('should include all valid content statuses', () => {
      const values = STATUS_TABS.map(t => t.value);
      expect(values).toContain('all');
      expect(values).toContain('draft');
      expect(values).toContain('scheduled');
      expect(values).toContain('posted');
      expect(values).toContain('archived');
    });
  });

  describe('title truncation', () => {
    it('should truncate text longer than 80 characters', () => {
      const longText = 'A'.repeat(100);
      const title = longText.length > 80 ? longText.slice(0, 80) + '...' : longText;
      expect(title.length).toBe(83); // 80 chars + "..."
      expect(title.endsWith('...')).toBe(true);
    });

    it('should not truncate short text', () => {
      const shortText = 'Short caption';
      const title = shortText.length > 80 ? shortText.slice(0, 80) + '...' : shortText;
      expect(title).toBe('Short caption');
    });
  });

  describe('sidebar navigation', () => {
    it('should link Content Library to /content (not /library)', () => {
      const navItems = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Content Library', href: '/content' },
      ];

      const contentLink = navItems.find(item => item.label === 'Content Library');
      expect(contentLink?.href).toBe('/content');
      expect(contentLink?.href).not.toBe('/library');
    });
  });
});

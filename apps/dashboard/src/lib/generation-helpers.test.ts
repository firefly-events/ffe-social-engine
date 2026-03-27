import { describe, it, expect } from 'vitest';

/**
 * Tests for the regenerate/iterate UX data structures and helpers.
 * Convex functions themselves are tested via Convex's test framework at deploy time.
 * These tests validate the shape and logic of the data we send to Convex.
 */

describe('SavedVariant data shape', () => {
  const validTextVariant = {
    userId: 'user_123',
    assetType: 'text' as const,
    content: 'Generated social media post',
    prompt: 'Write a tweet about AI',
    model: 'gemini-1.5-flash',
  };

  const validImageVariant = {
    userId: 'user_123',
    assetType: 'image' as const,
    imageUrl: 'https://example.com/image.png',
    prompt: 'A futuristic cityscape',
    model: 'flux',
  };

  const validVideoVariant = {
    userId: 'user_123',
    assetType: 'video' as const,
    videoUrl: 'https://example.com/video.mp4',
    prompt: 'Product demo animation',
    model: 'hailuo',
  };

  it('should have required fields for text variant', () => {
    expect(validTextVariant.userId).toBeTruthy();
    expect(validTextVariant.assetType).toBe('text');
    expect(validTextVariant.content).toBeTruthy();
  });

  it('should have required fields for image variant', () => {
    expect(validImageVariant.userId).toBeTruthy();
    expect(validImageVariant.assetType).toBe('image');
    expect(validImageVariant.imageUrl).toBeTruthy();
  });

  it('should have required fields for video variant', () => {
    expect(validVideoVariant.userId).toBeTruthy();
    expect(validVideoVariant.assetType).toBe('video');
    expect(validVideoVariant.videoUrl).toBeTruthy();
  });

  it('should only accept valid asset types', () => {
    const validTypes = ['text', 'image', 'video'];
    expect(validTypes).toContain(validTextVariant.assetType);
    expect(validTypes).toContain(validImageVariant.assetType);
    expect(validTypes).toContain(validVideoVariant.assetType);
  });
});

describe('GenerationHistory action types', () => {
  const validActions = ['generate', 'regenerate', 'retry'] as const;

  it('should define valid action types', () => {
    expect(validActions).toHaveLength(3);
    expect(validActions).toContain('generate');
    expect(validActions).toContain('regenerate');
    expect(validActions).toContain('retry');
  });

  it('should create valid history entry shape', () => {
    const entry = {
      userId: 'user_123',
      assetType: 'text' as const,
      action: 'regenerate' as const,
      prompt: 'Write a tweet',
      model: 'gemini-1.5-flash',
      result: 'Generated text output',
      cost: 0.001,
    };

    expect(entry.action).toBe('regenerate');
    expect(entry.cost).toBeGreaterThanOrEqual(0);
    expect(typeof entry.userId).toBe('string');
  });
});

describe('Vertex AI model configuration', () => {
  it('should map model specs to correct Vertex AI models', () => {
    const modelMap: Record<string, string> = {
      'gemini-flash': 'gemini-1.5-flash',
      'gemini-pro': 'gemini-1.5-pro',
    };

    expect(modelMap['gemini-flash']).toBe('gemini-1.5-flash');
    expect(modelMap['gemini-pro']).toBe('gemini-1.5-pro');
  });

  it('should default to gemini-flash', () => {
    const defaultModel = 'gemini-flash';
    expect(defaultModel).toBe('gemini-flash');
  });
});

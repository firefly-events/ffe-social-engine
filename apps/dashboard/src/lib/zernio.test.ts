import { describe, it, expect, beforeEach, vi } from 'vitest';
import { zernio, ZernioClient } from './zernio';

// Mock global fetch
global.fetch = vi.fn();

describe('ZernioClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should be instantiated', () => {
    expect(zernio).toBeInstanceOf(ZernioClient);
  });

  it('connectAccount should call the correct endpoint and return data', async () => {
    const mockResponse = { success: true, url: 'http://connect.url' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await zernio.connectAccount('user-123');

    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/connect', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ userId: 'user-123' })
    }));
    expect(result).toEqual(mockResponse);
  });

  it('getAccounts should call the correct endpoint', async () => {
    const mockResponse = { accounts: [] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await zernio.getAccounts('prof-123');

    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/profiles/prof-123/accounts', expect.any(Object));
    expect(result).toEqual(mockResponse);
  });

  it('createPost should send correct data', async () => {
    const mockResponse = { postId: 'post-1' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await zernio.createPost('prof-123', 'Hello world', ['twitter']);

    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/profiles/prof-123/post', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ content: 'Hello world', platforms: ['twitter'] })
    }));
    expect(result).toEqual(mockResponse);
  });

  it('should throw error on failed request', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(zernio.connectAccount('user-123')).rejects.toThrow('Failed to connect Zernio account');
  });
});

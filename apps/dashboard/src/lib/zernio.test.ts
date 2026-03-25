import { describe, it, expect, vi, beforeEach } from 'vitest';
import { zernio } from './zernio';

describe('ZernioClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should connect account successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    
    const result = await zernio.connectAccount('user-1');
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/connect', expect.any(Object));
  });

  it('should throw error on connect failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false });
    await expect(zernio.connectAccount('user-1')).rejects.toThrow('Failed to connect Zernio account');
  });

  it('should fetch accounts', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accounts: [] })
    });
    
    const result = await zernio.getAccounts('profile-1');
    expect(result.accounts).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/profiles/profile-1/accounts', expect.any(Object));
  });

  it('should create post', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });
    
    const result = await zernio.createPost('profile-1', 'content', ['twitter']);
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/profiles/profile-1/post', expect.any(Object));
  });

  it('should get analytics', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ metrics: [] })
    });
    
    const result = await zernio.getAnalytics('post-1');
    expect(result.metrics).toEqual([]);
    expect(global.fetch).toHaveBeenCalledWith('https://api.zernio.com/v1/posts/post-1/analytics', expect.any(Object));
  });
});

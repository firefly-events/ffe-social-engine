import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postToSocial, getAnalytics, getUserAccounts } from './social';
import { zernio } from '../../lib/zernio';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}));

vi.mock('convex/nextjs', () => ({
  fetchQuery: vi.fn()
}));

vi.mock('../../../../../convex/_generated/api', () => ({
  api: { users: { getUser: 'getUser' } }
}));

vi.mock('../../lib/zernio', () => ({
  zernio: {
    createPost: vi.fn(),
    getAnalytics: vi.fn(),
    getAccounts: vi.fn()
  }
}));

import { auth } from '@clerk/nextjs/server';
import { fetchQuery } from 'convex/nextjs';

describe('Social Actions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('postToSocial', () => {
    it('throws Unauthorized if no userId', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      await expect(postToSocial('content', ['twitter'])).rejects.toThrow('Unauthorized');
    });

    it('throws error if user not found or no zernio profile', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValue(null);
      await expect(postToSocial('content', ['twitter'])).rejects.toThrow('Zernio profile not connected');
    });

    it('creates post successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValue({ zernioProfileId: 'profile-1' });
      vi.mocked(zernio.createPost).mockResolvedValue({ success: true } as any);
      
      const res = await postToSocial('content', ['twitter']);
      expect(res).toEqual({ success: true });
      expect(zernio.createPost).toHaveBeenCalledWith('profile-1', 'content', ['twitter']);
    });
  });

  describe('getAnalytics', () => {
    it('throws Unauthorized if no userId', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      await expect(getAnalytics('post-1')).rejects.toThrow('Unauthorized');
    });

    it('gets analytics successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-1' } as any);
      vi.mocked(zernio.getAnalytics).mockResolvedValue({ metrics: [] } as any);
      
      const res = await getAnalytics('post-1');
      expect(res).toEqual({ metrics: [] });
      expect(zernio.getAnalytics).toHaveBeenCalledWith('post-1');
    });
  });

  describe('getUserAccounts', () => {
    it('throws Unauthorized if no userId', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);
      await expect(getUserAccounts()).rejects.toThrow('Unauthorized');
    });

    it('returns empty array if no zernio profile', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValue(null);
      
      const res = await getUserAccounts();
      expect(res).toEqual({ accounts: [] });
    });

    it('gets accounts successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValue({ zernioProfileId: 'profile-1' });
      vi.mocked(zernio.getAccounts).mockResolvedValue({ accounts: ['twitter'] } as any);
      
      const res = await getUserAccounts();
      expect(res).toEqual({ accounts: ['twitter'] });
      expect(zernio.getAccounts).toHaveBeenCalledWith('profile-1');
    });
  });
});

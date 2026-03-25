import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postToSocial, getAnalytics, getUserAccounts } from './social';
import { auth } from '@clerk/nextjs/server';
import { zernio } from '../../lib/zernio';
import { fetchQuery } from 'convex/nextjs';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('../../lib/zernio', () => ({
  zernio: {
    createPost: vi.fn(),
    getAnalytics: vi.fn(),
    getAccounts: vi.fn(),
  },
}));

vi.mock('convex/nextjs', () => ({
  fetchQuery: vi.fn(),
}));

// Mock the generated api path
vi.mock('../../../convex/_generated/api', () => ({
  api: {
    users: {
      getUser: 'getUser',
    },
  },
}));

describe('social actions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('postToSocial', () => {
    it('throws Unauthorized if no user', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
      await expect(postToSocial('hello', ['twitter'])).rejects.toThrow('Unauthorized');
    });

    it('throws if zernio profile not connected', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValueOnce({ zernioProfileId: null });
      await expect(postToSocial('hello', ['twitter'])).rejects.toThrow('Zernio profile not connected');
    });

    it('creates post successfully', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValueOnce({ zernioProfileId: 'prof-1' });
      vi.mocked(zernio.createPost).mockResolvedValueOnce({ success: true });

      const res = await postToSocial('hello', ['twitter']);
      expect(zernio.createPost).toHaveBeenCalledWith('prof-1', 'hello', ['twitter']);
      expect(res).toEqual({ success: true });
    });
  });

  describe('getAnalytics', () => {
    it('throws Unauthorized if no user', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
      await expect(getAnalytics('post-1')).rejects.toThrow('Unauthorized');
    });

    it('fetches analytics', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-1' } as any);
      vi.mocked(zernio.getAnalytics).mockResolvedValueOnce({ views: 100 });

      const res = await getAnalytics('post-1');
      expect(zernio.getAnalytics).toHaveBeenCalledWith('post-1');
      expect(res).toEqual({ views: 100 });
    });
  });

  describe('getUserAccounts', () => {
    it('throws Unauthorized if no user', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);
      await expect(getUserAccounts()).rejects.toThrow('Unauthorized');
    });

    it('returns empty accounts if no profile', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValueOnce({ zernioProfileId: null });

      const res = await getUserAccounts();
      expect(res).toEqual({ accounts: [] });
    });

    it('returns accounts from zernio', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-1' } as any);
      vi.mocked(fetchQuery).mockResolvedValueOnce({ zernioProfileId: 'prof-1' });
      vi.mocked(zernio.getAccounts).mockResolvedValueOnce({ accounts: ['acct-1'] });

      const res = await getUserAccounts();
      expect(zernio.getAccounts).toHaveBeenCalledWith('prof-1');
      expect(res).toEqual({ accounts: ['acct-1'] });
    });
  });
});

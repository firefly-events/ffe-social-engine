import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @clerk/nextjs
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
  UserProfile: () => <div data-testid="user-profile">UserProfile</div>,
}));

// Mock convex/react
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

// Mock @convex/_generated/api
vi.mock('@convex/_generated/api', () => ({
  api: {
    socialAccounts: {
      getSocialAccounts: 'socialAccounts.getSocialAccounts',
    },
  },
}));

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import SettingsPage from '../app/(dashboard)/settings/page';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { publicMetadata: { plan: 'pro' }, firstName: 'Test' },
      isLoaded: true,
      isSignedIn: true,
    } as any);
    vi.mocked(useQuery).mockReturnValue([] as any);

    const { container } = render(<SettingsPage />);
    expect(container).toBeTruthy();
  });

  it('renders "Settings" heading', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { publicMetadata: { plan: 'free' }, firstName: 'Test' },
      isLoaded: true,
      isSignedIn: true,
    } as any);
    vi.mocked(useQuery).mockReturnValue([] as any);

    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('renders Connected Accounts section heading', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { publicMetadata: { plan: 'free' }, firstName: 'Test' },
      isLoaded: true,
      isSignedIn: true,
    } as any);
    vi.mocked(useQuery).mockReturnValue([] as any);

    render(<SettingsPage />);
    expect(screen.getByText('Connected Accounts')).toBeTruthy();
  });

  it('renders connected accounts when provided', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { publicMetadata: { plan: 'pro' }, firstName: 'Test' },
      isLoaded: true,
      isSignedIn: true,
    } as any);

    const mockAccounts = [
      {
        _id: 'acc-1',
        platform: 'twitter',
        handle: '@testuser',
        connectedAt: new Date('2025-01-01').getTime(),
      },
      {
        _id: 'acc-2',
        platform: 'instagram',
        handle: '@testinsta',
        connectedAt: new Date('2025-02-15').getTime(),
      },
    ];
    vi.mocked(useQuery).mockReturnValue(mockAccounts as any);

    render(<SettingsPage />);
    expect(screen.getByText('twitter')).toBeTruthy();
    expect(screen.getByText('instagram')).toBeTruthy();
    // Handle text is split across nodes due to middot separator — use partial match
    expect(screen.getByText(/@testuser/, { exact: false })).toBeTruthy();
    expect(screen.getAllByText('Disconnect')).toHaveLength(2);
  });

  it('shows loading state when accounts are undefined', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { publicMetadata: {}, firstName: 'Test' },
      isLoaded: true,
      isSignedIn: true,
    } as any);
    vi.mocked(useQuery).mockReturnValue(undefined as any);

    render(<SettingsPage />);
    expect(screen.getByText('Loading accounts…')).toBeTruthy();
  });

  it('renders Billing section with plan name', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { publicMetadata: { plan: 'pro' }, firstName: 'Test' },
      isLoaded: true,
      isSignedIn: true,
    } as any);
    vi.mocked(useQuery).mockReturnValue([] as any);

    render(<SettingsPage />);
    expect(screen.getByText('Billing')).toBeTruthy();
    expect(screen.getByText('pro')).toBeTruthy();
    expect(screen.getByText('Manage Subscription')).toBeTruthy();
  });
});

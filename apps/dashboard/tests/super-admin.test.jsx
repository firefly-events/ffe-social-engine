import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuperAdminDashboardPage from '../src/app/super-admin/page';

// Mock Clerk useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { firstName: 'Admin', publicMetadata: { role: 'admin' } }
  }),
  UserButton: () => <div>UserButton</div>
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => vi.fn())
}));

// Mock Convex API
vi.mock('@convex/_generated/api', () => ({
  api: {
    admin: {
      getPlatformMetrics: 'admin:getPlatformMetrics',
      getUsers: 'admin:getUsers',
      getTierConfigs: 'admin:getTierConfigs'
    }
  }
}));

import { useQuery } from 'convex/react';

describe('SuperAdminDashboardPage', () => {
  it('renders loading state when metrics are not available', () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    render(<SuperAdminDashboardPage />);
    expect(screen.getByText(/Loading platform intelligence/i)).toBeInTheDocument();
  });

  it('renders metrics cards when data is loaded', () => {
    const mockMetrics = {
      totalUsers: 100,
      activeSubscriptions: 25,
      mrr: 450.50,
      totalContent: 1500,
      tierDistribution: {
        free: 75,
        starter: 10,
        pro: 10,
        business: 5
      }
    };
    vi.mocked(useQuery).mockReturnValue(mockMetrics);
    
    render(<SuperAdminDashboardPage />);
    
    expect(screen.getByText('Platform Health')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('25')).toBeInTheDocument(); // Active Subs
    expect(screen.getByText('$450.50')).toBeInTheDocument(); // MRR
    expect(screen.getByText('1500')).toBeInTheDocument(); // Content Created
  });
});

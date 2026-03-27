import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../src/app/(dashboard)/dashboard/page';

// Mock Clerk useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { firstName: 'Test', id: 'user_test123' }
  }),
  UserButton: () => <div>UserButton</div>
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}));

// Mock Convex react hooks — DashboardPage uses useQuery which requires ConvexProvider
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => undefined)
}));

// Mock Convex generated API
vi.mock('../convex/_generated/api', () => ({
  api: {
    users: { getCurrentUser: 'users:getCurrentUser' },
    posts: {
      getDashboardMetrics: 'posts:getDashboardMetrics',
      getRecentPosts: 'posts:getRecentPosts',
      getScheduledToday: 'posts:getScheduledToday',
      getPerformanceData: 'posts:getPerformanceData'
    }
  }
}));

describe('DashboardPage', () => {
  it('renders the welcome message', () => {
    render(<DashboardPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Welcome back/);
  });

  it('renders quick action cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('TikTok Video')).toBeInTheDocument();
    expect(screen.getByText('Instagram Reel')).toBeInTheDocument();
  });
});

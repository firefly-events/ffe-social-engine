import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/(dashboard)/dashboard/page';

// Mock Clerk useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { firstName: 'Test' }
  })
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
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

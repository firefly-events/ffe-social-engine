import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../src/app/(marketing)/page';

// Mock Clerk components
vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }) => <div>{children}</div>,
  SignedOut: ({ children }) => <div>{children}</div>,
  SignInButton: ({ children }) => <button>{children}</button>,
  UserButton: () => <div>UserButton</div>
}));

describe('Home', () => {
  it('renders the landing page', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Your social media/i);
  });
});

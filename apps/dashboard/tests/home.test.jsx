import { render } from '@testing-library/react';
import Home from '../src/app/page';
import { redirect } from 'next/navigation';
import { vi, describe, it, expect } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Home', () => {
  it('redirects to /dashboard', () => {
    render(<Home />);
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});

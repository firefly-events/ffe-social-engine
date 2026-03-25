import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Home from '../src/app/page';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Home', () => {
  it('redirects to /dashboard', () => {
    render(<Home />);
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
